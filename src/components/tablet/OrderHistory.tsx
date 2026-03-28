import React, { useState, useMemo } from "react";
import { ArrowLeft, ChevronRight, CreditCard, Banknote, QrCode, Search, Calendar } from "lucide-react";
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

const paymentIcons: Record<string, React.ReactNode> = {
  Visa: <CreditCard className="h-3.5 w-3.5" />,
  Mastercard: <CreditCard className="h-3.5 w-3.5" />,
  UnionPay: <CreditCard className="h-3.5 w-3.5" />,
  Cash: <Banknote className="h-3.5 w-3.5" />,
  Alipay: <QrCode className="h-3.5 w-3.5" />,
  "WeChat Pay": <QrCode className="h-3.5 w-3.5" />,
  PayNow: <QrCode className="h-3.5 w-3.5" />,
};

const serviceModeLabels: Record<string, { en: string; zh: string }> = {
  "dine-in": { en: "Dine-in", zh: "堂食" },
  takeaway: { en: "Takeaway", zh: "外带" },
  delivery: { en: "Delivery", zh: "外卖" },
  pickup: { en: "Pickup", zh: "自取" },
};

const allPaymentMethods = ["Visa", "Mastercard", "UnionPay", "Alipay", "WeChat Pay", "PayNow", "Cash"];
const allServiceModes = ["dine-in", "takeaway", "delivery", "pickup"];

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onClose }) => {
  const { t, lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchAmount, setSearchAmount] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (searchAmount) {
        const amt = parseFloat(searchAmount);
        if (!isNaN(amt) && Math.abs(o.total - amt) > 5) return false;
      }
      if (filterMethod !== "all" && o.paymentMethod !== filterMethod) return false;
      if (filterMode !== "all" && o.serviceMode !== filterMode) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(o.paidAt) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (new Date(o.paidAt) > to) return false;
      }
      return true;
    });
  }, [orders, searchAmount, filterMethod, filterMode, dateFrom, dateTo]);

  const selected = orders.find(o => o.id === selectedId);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-SG", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-SG", { month: "short", day: "numeric" });
  };

  // Order Detail View (side panel)
  if (selected) {
    return (
      <div className="flex flex-col h-full bg-card">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={() => setSelectedId(null)}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-[15px] font-bold text-foreground">{t("order_detail")}</h3>
            <span className="text-[11px] text-muted-foreground font-mono">#{selected.id.slice(-6)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pos-scrollbar px-4 py-3 space-y-4">
          {/* Items */}
          <div>
            <div className="section-label mb-2">{t("items")}</div>
            {selected.items.map((item, i) => (
              <div key={i} className="flex justify-between text-[13px] py-1.5 border-b border-border/50 last:border-0">
                <div className="flex-1">
                  <span className="text-foreground">{item.quantity}x {item.name}</span>
                  {item.modifiers.length > 0 && (
                    <div className="text-[11px] text-muted-foreground ml-4">
                      {item.modifiers.map(m => m.name).join(", ")}
                    </div>
                  )}
                </div>
                <span className="text-foreground font-mono font-medium ml-3">
                  ${((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>{t("subtotal")}</span><span className="font-mono">${selected.subtotal.toFixed(2)}</span>
            </div>
            {selected.discount > 0 && (
              <div className="flex justify-between text-[13px] text-status-green">
                <span>{t("discount")}</span><span className="font-mono">-${selected.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>{t("service_charge")} (10%)</span><span className="font-mono">${selected.serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>{t("gst")}</span><span className="font-mono">${selected.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[15px] font-bold text-foreground pt-2 border-t border-border">
              <span>{t("total")}</span><span className="font-mono">${selected.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Cash Payment Details */}
          {selected.paymentMethod === "Cash" && (
            <div className="bg-accent/50 rounded-xl p-3 space-y-2">
              <div className="section-label">{t("cash_payment")}</div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">{t("cash_received")}</span>
                <span className="font-bold text-foreground font-mono">
                  ${(selected.cashReceived ?? selected.total).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">{t("change")}</span>
                <span className="font-bold text-foreground font-mono">
                  ${(selected.changeDue ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[13px] pt-1.5 border-t border-border">
                <span className="font-bold text-foreground">{t("net_paid")}</span>
                <span className="font-bold text-primary font-mono">
                  ${selected.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Payment info */}
          <div className="border-t border-border pt-3 flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">{t("payment_method")}</span>
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              {paymentIcons[selected.paymentMethod]}
              <span>{selected.paymentMethod}</span>
            </div>
          </div>

          {/* Service mode + time */}
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>{lang === "zh" ? serviceModeLabels[selected.serviceMode]?.zh : serviceModeLabels[selected.serviceMode]?.en}</span>
            <span>{formatDate(selected.paidAt)} {formatTime(selected.paidAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Order List View (side panel)
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-[15px] font-bold text-foreground">{t("order_history")}</h3>
        </div>
        <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
          {filteredOrders.length}
        </span>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder={lang === "zh" ? "搜索金额..." : "Search amount..."}
            value={searchAmount}
            onChange={e => setSearchAmount(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full h-8 pl-7 pr-2 rounded-md bg-background border border-border text-[11px] text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="flex-1 relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full h-8 pl-7 pr-2 rounded-md bg-background border border-border text-[11px] text-foreground focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pos-scrollbar">
          <button onClick={() => setFilterMethod("all")}
            className={cn("px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap min-h-[32px]",
              filterMethod === "all" ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground")}>
            {t("all")}
          </button>
          {allPaymentMethods.map(m => (
            <button key={m} onClick={() => setFilterMethod(m)}
              className={cn("px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap min-h-[32px]",
                filterMethod === m ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground")}>
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <button onClick={() => setFilterMode("all")}
            className={cn("px-2 py-1 rounded-md text-[10px] font-medium min-h-[32px]",
              filterMode === "all" ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground")}>
            {t("all")}
          </button>
          {allServiceModes.map(m => (
            <button key={m} onClick={() => setFilterMode(m)}
              className={cn("px-2 py-1 rounded-md text-[10px] font-medium min-h-[32px]",
                filterMode === m ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground")}>
              {lang === "zh" ? serviceModeLabels[m]?.zh : serviceModeLabels[m]?.en}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pos-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {t("no_history")}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredOrders.map(order => {
              const sMode = serviceModeLabels[order.serviceMode];
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left min-h-[56px] active:bg-accent"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-foreground font-mono">${order.total.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded font-medium">
                        {lang === "zh" ? sMode?.zh : sMode?.en}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatDate(order.paidAt)} {formatTime(order.paidAt)}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        {paymentIcons[order.paymentMethod]}
                        <span>{order.paymentMethod}</span>
                      </div>
                      {order.tableNumber && (
                        <>
                          <span>·</span>
                          <span>T{order.tableNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
