import React, { useState, useMemo } from "react";
import { ArrowLeft, ChevronRight, CreditCard, Banknote, QrCode, Search, Calendar, Filter, X } from "lucide-react";
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

const paymentIcon = (method: string) => {
  if (["Visa", "Mastercard", "UnionPay"].includes(method)) return <CreditCard className="h-3.5 w-3.5" />;
  if (method === "Cash") return <Banknote className="h-3.5 w-3.5" />;
  return <QrCode className="h-3.5 w-3.5" />;
};

const serviceModeLabel: Record<string, { en: string; zh: string }> = {
  "dine-in": { en: "Dine-in", zh: "堂食" },
  takeaway: { en: "Takeaway", zh: "外带" },
  delivery: { en: "Delivery", zh: "外卖" },
  pickup: { en: "Pickup", zh: "自取" },
};

const paymentMethods = ["Visa", "Mastercard", "UnionPay", "Alipay", "WeChat Pay", "PayNow", "Cash"];

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onClose }) => {
  const { t, lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (search) {
        const q = search.toLowerCase();
        const matchAmt = o.total.toFixed(2).includes(q);
        const matchId = o.id.toLowerCase().includes(q);
        const matchTable = o.tableNumber?.includes(q);
        if (!matchAmt && !matchId && !matchTable) return false;
      }
      if (filterMethod !== "all" && o.paymentMethod !== filterMethod) return false;
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
    const map = new Map<string, PaidOrder[]>();
    filteredOrders.forEach(o => {
      const key = new Date(o.paidAt).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-SG", { year: "numeric", month: "short", day: "numeric" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    return map;
  }, [filteredOrders, lang]);

  // --- Detail View ---
  if (selected) {
    const { time, date } = fmt(selected.paidAt);
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={() => setSelectedId(null)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-foreground">{t("order_detail")}</h3>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-mono">#{selected.id.slice(-6)}</span>
              <span>·</span>
              <span>{date} {time}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pos-scrollbar">
          {/* Service mode + table badge */}
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="text-[11px] font-medium bg-accent text-foreground px-2.5 py-1 rounded-md">
              {lang === "zh" ? serviceModeLabel[selected.serviceMode]?.zh : serviceModeLabel[selected.serviceMode]?.en}
            </span>
            {selected.tableNumber && (
              <span className="text-[11px] font-medium bg-accent text-foreground px-2.5 py-1 rounded-md">
                T{selected.tableNumber}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1.5 text-[12px] font-medium text-foreground">
              {paymentIcon(selected.paymentMethod)}
              <span>{selected.paymentMethod}</span>
            </div>
          </div>

          {/* Items */}
          <div className="px-4">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("items")}</div>
            <div className="space-y-0">
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between py-2.5 border-b border-border/40 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-primary bg-primary/8 w-6 h-6 rounded flex items-center justify-center shrink-0">{item.quantity}</span>
                      <span className="text-[13px] text-foreground font-medium">{item.name}</span>
                    </div>
                    {item.modifiers.length > 0 && (
                      <div className="text-[11px] text-muted-foreground mt-0.5 ml-8">
                        {item.modifiers.map(m => m.name).join(", ")}
                      </div>
                    )}
                  </div>
                  <span className="text-[13px] font-semibold text-foreground font-mono ml-3 shrink-0">
                    ${((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="px-4 py-3 mt-2">
            <div className="bg-accent/50 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>{t("subtotal")}</span><span className="font-mono">${selected.subtotal.toFixed(2)}</span>
              </div>
              {selected.discount > 0 && (
                <div className="flex justify-between text-[12px] text-status-green font-medium">
                  <span>{t("discount")}</span><span className="font-mono">-${selected.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>{t("service_charge")} 10%</span><span className="font-mono">${selected.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>{t("gst")}</span><span className="font-mono">${selected.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold text-foreground pt-2 border-t border-border">
                <span>{t("total")}</span><span className="font-mono">${selected.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cash details */}
          {selected.paymentMethod === "Cash" && (
            <div className="px-4 pb-3">
              <div className="bg-status-amber-light/50 rounded-xl p-3.5 space-y-2">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("cash_payment")}</div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">{t("cash_received")}</span>
                  <span className="font-bold text-foreground font-mono">${(selected.cashReceived ?? selected.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">{t("change")}</span>
                  <span className="font-bold text-status-amber font-mono">${(selected.changeDue ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] pt-2 border-t border-border/50">
                  <span className="font-semibold text-foreground">{t("net_paid")}</span>
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
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-[14px] font-bold text-foreground flex-1">{t("order_history")}</h3>
        <span className="text-[11px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">{filteredOrders.length}</span>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder={lang === "zh" ? "搜索金额、桌号..." : "Search amount, table..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-10 rounded-xl bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Payment method filter chips */}
      <div className="px-4 pb-2">
        <div className="flex gap-1.5 overflow-x-auto pos-scrollbar pb-1">
          <button onClick={() => setFilterMethod("all")}
            className={cn("px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors min-h-[32px]",
              filterMethod === "all" ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground")}>
            {t("all")}
          </button>
          {paymentMethods.map(m => (
            <button key={m} onClick={() => setFilterMethod(filterMethod === m ? "all" : m)}
              className={cn("flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors min-h-[32px]",
                filterMethod === m ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground")}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Order List - grouped by date */}
      <div className="flex-1 overflow-y-auto pos-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <Search className="h-8 w-8 opacity-20" />
            <p className="text-[13px]">{t("no_history")}</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([dateLabel, dayOrders]) => (
            <div key={dateLabel}>
              {/* Date header */}
              <div className="sticky top-0 z-[1] bg-background/95 backdrop-blur-sm px-4 py-1.5 border-b border-border/50">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{dateLabel}</span>
              </div>
              {/* Orders for this date */}
              {dayOrders.map(order => {
                const { time } = fmt(order.paidAt);
                const modeLabel = lang === "zh" ? serviceModeLabel[order.serviceMode]?.zh : serviceModeLabel[order.serviceMode]?.en;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left min-h-[60px] active:bg-accent border-b border-border/30"
                  >
                    {/* Amount pill */}
                    <div className="w-[72px] shrink-0">
                      <span className="text-[14px] font-bold text-foreground font-mono">${order.total.toFixed(2)}</span>
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] text-muted-foreground">{time}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="text-[11px] text-muted-foreground">{modeLabel}</span>
                        {order.tableNumber && (
                          <>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-[11px] text-muted-foreground">T{order.tableNumber}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {paymentIcon(order.paymentMethod)}
                        <span>{order.paymentMethod}</span>
                        <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">#{order.id.slice(-4)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
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
