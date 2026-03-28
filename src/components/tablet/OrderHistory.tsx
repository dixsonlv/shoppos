import React, { useState, useMemo } from "react";
import { ArrowLeft, ChevronRight, CreditCard, Banknote, QrCode, Search, X, Clock, Receipt, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

export interface PaidOrder {
  id: string;
  tableNumber?: string;
  serviceMode: "dine-in" | "takeaway" | "delivery" | "pickup";
  items: { name: string; quantity: number; price: number; modifiers: { name: string; price: number }[] }[];
  subtotal: number;
  discount: number;
  serviceCharge: number;
  gst: number;
  total: number;
  paidAt: string;
  paymentMethod: string;
  cashReceived?: number;
  changeDue?: number;
}

interface OrderHistoryProps {
  orders: PaidOrder[];
  onClose: () => void;
}

const paymentIcon = (method: string, size = "h-3 w-3") => {
  if (["Visa", "Mastercard", "UnionPay"].includes(method)) return <CreditCard className={size} />;
  if (method === "Cash") return <Banknote className={size} />;
  return <QrCode className={size} />;
};

const serviceModeLabel: Record<string, { en: string; zh: string }> = {
  "dine-in": { en: "Dine-in", zh: "堂食" },
  takeaway: { en: "Takeaway", zh: "外带" },
  delivery: { en: "Delivery", zh: "外卖" },
  pickup: { en: "Pickup", zh: "自取" },
};

const paymentMethods = ["All", "Visa", "Mastercard", "UnionPay", "Alipay", "WeChat Pay", "PayNow", "Cash"];

const serviceModeColors: Record<string, string> = {
  "dine-in": "bg-status-blue-light text-primary",
  takeaway: "bg-status-amber-light text-status-amber",
  delivery: "bg-status-green-light text-status-green",
  pickup: "bg-accent text-muted-foreground",
};

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onClose }) => {
  const { t, lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("All");

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (search) {
        const q = search.toLowerCase();
        const matchAmt = o.total.toFixed(2).includes(q);
        const matchId = o.id.toLowerCase().includes(q);
        const matchTable = o.tableNumber?.includes(q);
        const matchItem = o.items.some(i => i.name.toLowerCase().includes(q));
        if (!matchAmt && !matchId && !matchTable && !matchItem) return false;
      }
      if (filterMethod !== "All" && o.paymentMethod !== filterMethod) return false;
      return true;
    });
  }, [orders, search, filterMethod]);

  const selected = orders.find(o => o.id === selectedId);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const time = d.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-SG", { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-SG", { month: "short", day: "numeric" });
    return { time, date };
  };

  // Group orders by date
  const grouped = useMemo(() => {
    const map = new Map<string, { orders: PaidOrder[]; dayTotal: number }>();
    filteredOrders.forEach(o => {
      const key = new Date(o.paidAt).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-SG", { weekday: "short", month: "short", day: "numeric" });
      if (!map.has(key)) map.set(key, { orders: [], dayTotal: 0 });
      const entry = map.get(key)!;
      entry.orders.push(o);
      entry.dayTotal += o.total;
    });
    return map;
  }, [filteredOrders, lang]);

  // Summary stats
  const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);

  // --- Detail View ---
  if (selected) {
    const { time, date } = fmt(selected.paidAt);
    const modeLabel = lang === "zh" ? serviceModeLabel[selected.serviceMode]?.zh : serviceModeLabel[selected.serviceMode]?.en;
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSelectedId(null)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-foreground font-mono">#{selected.id.slice(-6)}</span>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md", serviceModeColors[selected.serviceMode])}>
                {modeLabel}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{date} · {time}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pos-scrollbar">
          {/* Table + Payment info */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-border/50">
            {selected.tableNumber && (
              <span className="text-[11px] font-semibold bg-accent text-foreground px-2.5 py-1 rounded-md">
                Table {selected.tableNumber}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1.5 text-[12px] text-foreground">
              {paymentIcon(selected.paymentMethod, "h-3.5 w-3.5")}
              <span className="font-medium">{selected.paymentMethod}</span>
            </div>
          </div>

          {/* Items */}
          <div className="px-4 py-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Items ({selected.items.length})</div>
            <div className="space-y-0">
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-primary bg-primary/8 w-5 h-5 rounded flex items-center justify-center shrink-0">{item.quantity}</span>
                      <span className="text-[12px] text-foreground font-medium">{item.name}</span>
                    </div>
                    {item.modifiers.length > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 ml-7">
                        {item.modifiers.map(m => m.name).join(", ")}
                      </div>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold text-foreground font-mono ml-3 shrink-0">
                    ${((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="px-4 pb-3">
            <div className="bg-accent/40 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Subtotal</span><span className="font-mono">${selected.subtotal.toFixed(2)}</span>
              </div>
              {selected.discount > 0 && (
                <div className="flex justify-between text-[11px] text-status-green font-medium">
                  <span>Discount</span><span className="font-mono">-${selected.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Svc 10%</span><span className="font-mono">${selected.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>GST 9%</span><span className="font-mono">${selected.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-foreground pt-1.5 border-t border-border">
                <span>Total</span><span className="font-mono">${selected.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cash details */}
          {selected.paymentMethod === "Cash" && (
            <div className="px-4 pb-3">
              <div className="bg-status-amber-light/40 rounded-xl p-3 space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Cash Transaction</div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Tendered</span>
                  <span className="font-bold text-foreground font-mono">${(selected.cashReceived ?? selected.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Change</span>
                  <span className="font-bold text-status-amber font-mono">${(selected.changeDue ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[12px] pt-1.5 border-t border-border/40">
                  <span className="font-semibold text-foreground">Net Received</span>
                  <span className="font-bold text-primary font-mono">${selected.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Compact Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <button onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-bold text-foreground">{t("order_history")}</h3>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{filteredOrders.length} orders</span>
            <span>·</span>
            <span className="font-mono font-semibold text-foreground">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-2 pb-1.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder={lang === "zh" ? "搜索金额、桌号、菜品..." : "Search amount, table, item..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-8 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-accent">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Filter chips - compact horizontal scroll */}
      <div className="px-3 pb-2">
        <div className="flex gap-1 overflow-x-auto pos-scrollbar pb-0.5">
          {paymentMethods.map(m => (
            <button key={m} onClick={() => setFilterMethod(m)}
              className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors",
                filterMethod === m ? "bg-primary text-primary-foreground" : "bg-accent/60 text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {m !== "All" && paymentIcon(m, "h-2.5 w-2.5")}
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-y-auto pos-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-12">
            <Receipt className="h-8 w-8 opacity-15" />
            <p className="text-[12px]">No orders found</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([dateLabel, { orders: dayOrders, dayTotal }]) => (
            <div key={dateLabel}>
              {/* Date separator */}
              <div className="sticky top-0 z-[1] bg-background/95 backdrop-blur-sm px-3 py-1 border-b border-border/40 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{dateLabel}</span>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground">${dayTotal.toFixed(2)}</span>
              </div>
              {/* Order rows — compact table-like */}
              {dayOrders.map(order => {
                const { time } = fmt(order.paidAt);
                const modeLabel = lang === "zh" ? serviceModeLabel[order.serviceMode]?.zh : serviceModeLabel[order.serviceMode]?.en;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-accent/40 transition-colors text-left border-b border-border/20 active:bg-accent min-h-[52px]"
                  >
                    {/* Time */}
                    <div className="w-[42px] shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono">{time}</span>
                    </div>
                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-bold text-foreground font-mono">${order.total.toFixed(2)}</span>
                        <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded", serviceModeColors[order.serviceMode])}>
                          {modeLabel}
                        </span>
                        {order.tableNumber && (
                          <span className="text-[9px] font-medium bg-accent text-muted-foreground px-1.5 py-0.5 rounded">T{order.tableNumber}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                        {paymentIcon(order.paymentMethod, "h-2.5 w-2.5")}
                        <span>{order.paymentMethod}</span>
                        <span className="mx-0.5">·</span>
                        <span>{order.items.length} items</span>
                        <span className="font-mono ml-auto text-muted-foreground/50">#{order.id.slice(-4)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/25 shrink-0" />
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
