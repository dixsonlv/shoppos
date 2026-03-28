import React from "react";
import { Minus, Plus, Trash2, Users, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order, type Table } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

interface CheckPanelProps {
  order: Order | null;
  table?: Table;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPay: () => void;
}

export const CheckPanel: React.FC<CheckPanelProps> = ({ order, table, onUpdateQuantity, onRemoveItem, onPay }) => {
  const { t } = useLanguage();

  if (!order) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        {t("select_table_start")}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {table ? `${t("tables")} ${table.number}` : `${order.serviceMode}`}
          </h3>
          <span className="text-[11px] text-muted-foreground">{order.serviceMode}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
          <Users className="w-3.5 h-3.5" />
          {order.guestCount}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto pos-scrollbar px-3 py-2">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-1">
            <UtensilsCrossed className="w-8 h-8 opacity-30" />
            <p className="font-medium">{t("no_items")}</p>
            <p className="text-xs">{t("add_from_menu")}</p>
          </div>
        ) : (
          order.items.map(item => (
            <div key={item.id} className="group py-2.5 border-b border-border/50 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium text-foreground flex-1">{item.name}</span>
                <span className="text-[13px] font-semibold text-foreground font-mono whitespace-nowrap">
                  ${((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
              {item.modifiers.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {item.modifiers.map(m => m.name).join(", ")}
                </p>
              )}
              {item.notes && (
                <p className="text-[11px] text-muted-foreground mt-0.5">📝 {item.notes}</p>
              )}
              <div className="flex items-center gap-1.5 mt-1.5">
                <button onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-7 h-7 rounded-md bg-accent flex items-center justify-center hover:bg-secondary transition-colors active:scale-90">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[13px] font-semibold w-5 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-7 h-7 rounded-md bg-accent flex items-center justify-center hover:bg-secondary transition-colors active:scale-90">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onRemoveItem(item.id)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all ml-auto active:scale-90">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals & Pay */}
      <div className="border-t border-border px-4 py-3 space-y-1.5">
        <div className="flex justify-between text-[12px] text-muted-foreground">
          <span>{t("subtotal")}</span><span className="font-mono">${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[12px] text-muted-foreground">
          <span>{t("service_charge")} (10%)</span><span className="font-mono">${order.serviceCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[12px] text-muted-foreground">
          <span>{t("gst")}</span><span className="font-mono">${order.gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border">
          <span>{t("total")}</span><span className="font-mono">${order.total.toFixed(2)}</span>
        </div>
        <Button
          onClick={onPay}
          disabled={order.items.length === 0}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-bold mt-2 active:scale-[0.97] transition-transform"
        >
          {t("pay")} ${order.total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};
