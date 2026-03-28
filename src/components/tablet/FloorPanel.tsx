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
}

const statusConfig: Record<TableStatus, { dot: string; stripe: string; bg: string; border: string; labelKey: string }> = {
  available:  { dot: "bg-status-green",  stripe: "bg-status-green",            bg: "bg-status-green/[0.05]",  border: "border-status-green/15",  labelKey: "available" },
  reserved:   { dot: "bg-primary",       stripe: "bg-primary",                 bg: "bg-primary/[0.05]",       border: "border-primary/15",       labelKey: "reserved" },
  ordering:   { dot: "bg-status-amber",  stripe: "bg-status-amber",            bg: "bg-status-amber/[0.05]",  border: "border-status-amber/15",  labelKey: "ordering" },
  ordered:    { dot: "bg-[hsl(24,80%,45%)]", stripe: "bg-[hsl(24,80%,45%)]",   bg: "bg-[hsl(24,80%,45%)]/[0.05]", border: "border-[hsl(24,80%,45%)]/15", labelKey: "ordered" },
  dirty:      { dot: "bg-status-red",    stripe: "bg-status-red",              bg: "bg-status-red/[0.05]",    border: "border-status-red/15",    labelKey: "dirty" },
  cleaning:   { dot: "bg-muted-foreground", stripe: "bg-muted-foreground/60",  bg: "bg-muted/40",             border: "border-border",           labelKey: "cleaning" },
};

const allStatuses: TableStatus[] = ["available", "reserved", "ordering", "ordered", "dirty", "cleaning"];

export const FloorPanel: React.FC<FloorPanelProps> = ({
  tables, selectedTableId, onSelectTable, onCreateWalkIn,
  onTransferTable, onMergeTables, onSplitTable,
  isFullscreen, onToggleFullscreen,
}) => {
  const { t } = useLanguage();
  const [activeZone, setActiveZone] = useState<string>("All");
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
    <div className={cn(
      "bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300",
      isFullscreen ? "absolute inset-0 z-40 border-r-0" : "w-64"
    )}>
      {/* Header with logo */}
      <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
        <img src={uniwebLogo} alt="Uniweb" className="w-7 h-7 rounded-[7px] flex-shrink-0" />
        <h2 className="font-semibold text-foreground text-[13px] flex-1">{t("floor")}</h2>
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search_table")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border">
        {[t("all"), ...zones].map((zone, idx) => {
          const rawZone = idx === 0 ? "All" : zones[idx - 1];
          return (
            <button
              key={rawZone}
              onClick={() => setActiveZone(rawZone)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                activeZone === rawZone
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {zone}
            </button>
          );
        })}
      </div>

      {/* Status Legend — fixed below zones */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 border-b border-border bg-accent/30">
        {allStatuses.map(status => {
          const cfg = statusConfig[status];
          return (
            <div key={status} className="flex items-center gap-1.5">
              <span className={cn("w-[7px] h-[7px] rounded-full", cfg.dot)} />
              <span className="text-[10px] text-muted-foreground font-medium">{t(cfg.labelKey)}</span>
            </div>
          );
        })}
      </div>

      {/* Action mode banner */}
      {tableAction && (
        <div className="px-3 py-2 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-primary">
              {tableAction === "transfer" && t("select_target")}
              {tableAction === "merge" && `${t("select_tables_to_merge")} (${mergeTargets.length})`}
              {tableAction === "split" && t("split_table")}
            </span>
            <button onClick={cancelAction} className="p-0.5 rounded hover:bg-accent">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          {tableAction === "split" && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-foreground">{t("split_into")}</span>
              <div className="flex items-center gap-1">
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setSplitCount(n)}
                    className={cn(
                      "w-7 h-7 rounded-md text-xs font-bold transition-colors",
                      splitCount === n ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button onClick={handleConfirmSplit} className="ml-auto p-1 rounded-md bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {tableAction === "merge" && mergeTargets.length >= 2 && (
            <Button size="sm" className="w-full mt-2 h-7 text-xs rounded-md" onClick={handleConfirmMerge}>
              {t("merge_confirm")} ({mergeTargets.length} {t("tables")})
            </Button>
          )}
        </div>
      )}

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-3">
        <div className={cn(
          "grid gap-2",
          isFullscreen ? "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8" : "grid-cols-2"
        )}>
          {filteredTables.map(table => {
            const cfg = statusConfig[table.status];
            const isSelected = selectedTableId === table.id;
            const isMergeTarget = mergeTargets.includes(table.id);
            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={cn(
                  "relative rounded-lg border-1.5 text-left transition-all overflow-hidden",
                  cfg.bg, cfg.border,
                  isSelected && "ring-2 ring-primary ring-offset-1",
                  isMergeTarget && "ring-2 ring-primary ring-offset-1 bg-primary/10",
                  tableAction === "transfer" && table.status !== "available" && table.id !== selectedTableId && "opacity-40 pointer-events-none"
                )}
              >
                {/* Status stripe — TOP */}
                <div className={cn("w-full h-[3px] rounded-t-lg", cfg.stripe)} />

                {/* Fixed-height content area */}
                <div className="px-2.5 py-2 h-[72px] flex flex-col justify-between">
                  {/* Row 1: Table number + status dot */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-[14px] leading-none">T{table.number}</span>
                    <span className={cn("w-[6px] h-[6px] rounded-full flex-shrink-0", cfg.dot)} />
                  </div>

                  {/* Row 2: Pax */}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="h-2.5 w-2.5 flex-shrink-0" />
                    <span>{table.guestCount || 0}/{table.seats}</span>
                  </div>

                  {/* Row 3: Amount + elapsed — always present row (may be empty) */}
                  <div className="flex items-center justify-between min-h-[14px]">
                    {table.openAmount !== undefined && table.openAmount > 0 ? (
                      <span className="text-[11px] font-semibold text-foreground font-mono leading-none">${table.openAmount.toFixed(2)}</span>
                    ) : (
                      <span />
                    )}
                    {table.elapsedMinutes !== undefined && table.elapsedMinutes > 0 ? (
                      <span className="text-[10px] text-muted-foreground leading-none">{table.elapsedMinutes}m</span>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>

                {/* Merged indicator */}
                {table.mergedWith && table.mergedWith.length > 0 && (
                  <div className="px-2.5 pb-1 text-[9px] text-primary font-medium">
                    +T{table.mergedWith.map(id => tables.find(t => t.id === id)?.number).join(",T")}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Actions */}
      {showActions && !isFullscreen && (
        <div className="px-3 py-2 border-t border-border">
          <div className="flex gap-1">
            <button
              onClick={() => setTableAction("transfer")}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              {t("transfer_table")}
            </button>
            <button
              onClick={() => { setTableAction("merge"); setMergeTargets(selectedTableId ? [selectedTableId] : []); }}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Merge className="h-3.5 w-3.5" />
              {t("merge_tables")}
            </button>
            <button
              onClick={() => setTableAction("split")}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Split className="h-3.5 w-3.5" />
              {t("split_table")}
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isFullscreen && (
        <div className="p-3 border-t border-border space-y-1.5">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs rounded-lg" onClick={() => onCreateWalkIn("takeaway")}>
            <ShoppingBag className="h-3.5 w-3.5" />{t("takeaway_order")}
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs rounded-lg" onClick={() => onCreateWalkIn("delivery")}>
            <Truck className="h-3.5 w-3.5" />{t("delivery_order")}
          </Button>
        </div>
      )}
    </div>
  );
};
