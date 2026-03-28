import React, { useState } from "react";
import { X, ChevronRight, CreditCard, Banknote, QrCode, Receipt } from "lucide-react";
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
  paymentMethod: string; // "Visa" | "Mastercard" | "UnionPay" | "Alipay" | "WeChat Pay" | "PayNow" | "Cash"
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

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onClose }) => {
  const { t, lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = orders.find(o => o.id === selectedId);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-SG", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-SG", { month: "short", day: "numeric" });
  };

  if (selected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onClose}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up border-1.5 border-border max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedId(null)} className="p-1 rounded-md hover:bg-accent text-muted-foreground">
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <div>
                <h3 className="text-[15px] font-bold text-foreground">{t("order_detail")}</h3>
                <span className="text-[11px] text-muted-foreground font-mono">#{selected.id.slice(-6)}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Detail content */}
          <div className="flex-1 overflow-y-auto pos-scrollbar p-5 space-y-4">
            {/* Items */}
            <div>
              <div className="section-label mb-2">{t("items")}</div>
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[13px]">
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
            </div>

            {/* Totals breakdown */}
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-[13px] text-muted-foreground">
                <span>{t("subtotal")}</span>
                <span className="font-mono">${selected.subtotal.toFixed(2)}</span>
              </div>
              {selected.discount > 0 && (
                <div className="flex justify-between text-[13px] text-status-green">
                  <span>{t("discount")}</span>
                  <span className="font-mono">-${selected.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] text-muted-foreground">
                <span>{t("service_charge")} (10%)</span>
                <span className="font-mono">${selected.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-muted-foreground">
                <span>{t("gst")}</span>
                <span className="font-mono">${selected.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold text-foreground pt-2 border-t border-border">
                <span>{t("total")}</span>
                <span className="font-mono">${selected.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="border-t border-border pt-3 flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">{t("payment_method")}</span>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                {paymentIcons[selected.paymentMethod]}
                <span>{selected.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up border-1.5 border-border max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <h3 className="text-[15px] font-bold text-foreground">{t("order_history")}</h3>
            <span className="text-[11px] text-muted-foreground bg-accent px-2 py-0.5 rounded-md font-medium">
              {orders.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pos-scrollbar">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Receipt className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-[13px]">{t("no_history")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map(order => {
                const sMode = serviceModeLabels[order.serviceMode];
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-accent/50 transition-colors text-left"
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
    </div>
  );
};
