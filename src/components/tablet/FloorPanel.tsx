import React, { useState } from "react";
import { Search, ShoppingBag, Truck, ArrowRightLeft, Merge, Split, X, Check, Users, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Table, type TableStatus, type ServiceMode, zones } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";
import uniwebLogo from "@/assets/uniweb-logo.jpg";

type TableAction = "transfer" | "merge" | "split" | null;

interface FloorPanelProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onCreateWalkIn: (mode: ServiceMode) => void;
  onTransferTable?: (fromId: string, toId: string) => void;
  onMergeTables?: (tableIds: string[]) => void;
  onSplitTable?: (tableId: string, count: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  tableManagementEnabled?: boolean;
}

const statusConfig: Record<TableStatus, { dot: string; stripe: string; bg: string; border: string; labelKey: string }> = {
  available: { dot: "bg-status-green", stripe: "bg-status-green", bg: "bg-status-green/[0.05]", border: "border-status-green/30", labelKey: "available" },
  reserved: { dot: "bg-primary", stripe: "bg-primary", bg: "bg-primary/[0.05]", border: "border-primary/30", labelKey: "reserved" },
  ordering: { dot: "bg-status-amber", stripe: "bg-status-amber", bg: "bg-status-amber/[0.05]", border: "border-status-amber/30", labelKey: "ordering" },
  ordered: { dot: "bg-[hsl(24,80%,45%)]", stripe: "bg-[hsl(24,80%,45%)]", bg: "bg-[hsl(24,80%,45%)]/[0.05]", border: "border-[hsl(24,80%,45%)]/30", labelKey: "ordered" },
  dirty: { dot: "bg-status-red", stripe: "bg-status-red", bg: "bg-status-red/[0.05]", border: "border-status-red/30", labelKey: "dirty" },
  cleaning: { dot: "bg-muted-foreground", stripe: "bg-muted-foreground/60", bg: "bg-muted/40", border: "border-border", labelKey: "cleaning" },
};

const allStatuses: TableStatus[] = ["available", "reserved", "ordering", "ordered", "dirty", "cleaning"];

export const FloorPanel: React.FC<FloorPanelProps> = ({
  tables, selectedTableId, onSelectTable, onCreateWalkIn,
  onTransferTable, onMergeTables, onSplitTable,
  isFullscreen, onToggleFullscreen, tableManagementEnabled = true,
}) => {
  const { t } = useLanguage();
  const [activeZone, setActiveZone] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableAction, setTableAction] = useState<TableAction>(null);
  const [mergeTargets, setMergeTargets] = useState<string[]>([]);
  const [splitCount, setSplitCount] = useState(2);

  const filteredTables = tables.filter(t => {
    if (activeZone !== "All" && t.zone !== activeZone) return false;
    if (searchQuery && !t.number.includes(searchQuery)) return false;
    return true;
  });

  const handleTableClick = (tableId: string) => {
    if (tableAction === "transfer" && selectedTableId) {
      if (tableId !== selectedTableId) {
        onTransferTable?.(selectedTableId, tableId);
        setTableAction(null);
      }
      return;
    }
    if (tableAction === "merge") {
      setMergeTargets(prev =>
        prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
      );
      return;
    }
    onSelectTable(tableId);
  };

  const handleConfirmMerge = () => {
    if (mergeTargets.length >= 2) onMergeTables?.(mergeTargets);
    setMergeTargets([]);
    setTableAction(null);
  };

  const handleConfirmSplit = () => {
    if (selectedTableId && splitCount >= 2) onSplitTable?.(selectedTableId, splitCount);
    setTableAction(null);
  };

  const cancelAction = () => { setTableAction(null); setMergeTargets([]); };

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const showActions = selectedTable && !tableAction && (selectedTable.status === "ordering" || selectedTable.status === "ordered" || selectedTable.status === "available");

  return (
    <div className="flex flex-col h-full">
      {/* Header with logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={uniwebLogo} alt="Uniweb" className="w-7 h-7 rounded-md object-cover" />
          <h2 className="text-sm font-bold text-foreground">{t("floor")}</h2>
        </div>
        <button onClick={onToggleFullscreen}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-90">
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder={t("search_table")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex gap-1 px-4 py-1 overflow-x-auto pos-scrollbar">
        {[t("all"), ...zones].map((zone, idx) => {
          const rawZone = idx === 0 ? "All" : zones[idx - 1];
          return (
            <button key={rawZone} onClick={() => setActiveZone(rawZone)}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors min-h-[36px]",
                activeZone === rawZone
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}>
              {zone}
            </button>
          );
        })}
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-3 px-4 py-1.5">
        {allStatuses.map(status => {
          const cfg = statusConfig[status];
          return (
            <div key={status} className="flex items-center gap-1">
              <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
              <span className="text-[10px] text-muted-foreground">{t(cfg.labelKey)}</span>
            </div>
          );
        })}
      </div>

      {/* Action mode banner */}
      {tableAction && (
        <div className="mx-4 my-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-primary">
              {tableAction === "transfer" && t("select_target")}
              {tableAction === "merge" && `${t("select_tables_to_merge")} (${mergeTargets.length})`}
              {tableAction === "split" && t("split_table")}
            </span>
            <button onClick={cancelAction} className="p-1 rounded-md hover:bg-accent min-h-[36px] min-w-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {tableAction === "split" && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-muted-foreground">{t("split_into")}</span>
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => setSplitCount(n)}
                  className={cn(
                    "w-8 h-8 rounded-md text-xs font-bold transition-colors",
                    splitCount === n ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                  )}>
                  {n}
                </button>
              ))}
              <Button size="sm" onClick={handleConfirmSplit} className="ml-auto min-h-[36px]">
                <Check className="w-4 h-4" />
              </Button>
            </div>
          )}
          {tableAction === "merge" && mergeTargets.length >= 2 && (
            <Button size="sm" className="w-full mt-2 min-h-[40px]" onClick={handleConfirmMerge}>
              {t("merge_confirm")} ({mergeTargets.length} {t("tables")})
            </Button>
          )}
        </div>
      )}

      {/* Table Grid — Redesigned per screenshot reference */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-3 grid grid-cols-4 gap-3 auto-rows-min">
        {filteredTables.map(table => {
          const cfg = statusConfig[table.status];
          const isSelected = selectedTableId === table.id;
          const isMergeTarget = mergeTargets.includes(table.id);
          return (
            <button key={table.id}
              onClick={() => handleTableClick(table.id)}
              className={cn(
                "relative rounded-xl border-[2px] text-left transition-all overflow-hidden min-h-[110px] active:scale-[0.97]",
                cfg.bg, cfg.border,
                isSelected && "ring-2 ring-primary ring-offset-1",
                isMergeTarget && "ring-2 ring-primary ring-offset-1 bg-primary/10",
                tableAction === "transfer" && table.status !== "available" && table.id !== selectedTableId && "opacity-40 pointer-events-none"
              )}
            >
              {/* Status stripe — TOP */}
              <div className={cn("absolute top-0 left-0 w-full h-[3px] rounded-t-xl", cfg.stripe)} />

              {/* Fixed-height content area — Strict alignment */}
              <div className="p-3 flex flex-col h-full">
                {/* Row 1: Table number + status dot — always top */}
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-bold text-foreground">#{table.number}</span>
                  <span className={cn("w-3 h-3 rounded-full flex-shrink-0", cfg.dot)} />
                </div>

                {/* Row 2: Pax — fixed position */}
                <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[12px]">{table.seats} {t("seats")}</span>
                </div>

                {/* Row 3: Status label — always bottom */}
                <div className="mt-auto pt-2">
                  <span className={cn(
                    "inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md",
                    table.status === "available" && "bg-status-green/10 text-status-green",
                    table.status === "reserved" && "bg-primary/10 text-primary",
                    table.status === "ordering" && "bg-status-amber/10 text-status-amber",
                    table.status === "ordered" && "bg-[hsl(24,80%,45%)]/10 text-[hsl(24,80%,45%)]",
                    table.status === "dirty" && "bg-status-red/10 text-status-red",
                    table.status === "cleaning" && "bg-muted text-muted-foreground",
                  )}>
                    {t(cfg.labelKey)}
                  </span>
                </div>

                {/* Merged indicator */}
                {table.mergedWith && table.mergedWith.length > 0 && (
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    +T{table.mergedWith.map(id => tables.find(t => t.id === id)?.number).join(",T")}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Table Actions */}
      {showActions && !isFullscreen && (
        <div className="px-3 py-2 border-t border-border">
          <div className="flex gap-2">
            <button onClick={() => setTableAction("transfer")}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[48px] active:scale-95">
              <ArrowRightLeft className="w-4 h-4" />{t("transfer_table")}
            </button>
            <button onClick={() => { setTableAction("merge"); setMergeTargets(selectedTableId ? [selectedTableId] : []); }}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[48px] active:scale-95">
              <Merge className="w-4 h-4" />{t("merge_tables")}
            </button>
            <button onClick={() => setTableAction("split")}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[48px] active:scale-95">
              <Split className="w-4 h-4" />{t("split_table")}
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isFullscreen && (
        <div className="px-3 py-2 border-t border-border">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onCreateWalkIn("takeaway")} className="flex-1 h-11 text-xs min-h-[44px] active:scale-95">
              <ShoppingBag className="w-4 h-4 mr-1" />{t("takeaway_order")}
            </Button>
            <Button variant="outline" onClick={() => onCreateWalkIn("delivery")} className="flex-1 h-11 text-xs min-h-[44px] active:scale-95">
              <Truck className="w-4 h-4 mr-1" />{t("delivery_order")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
