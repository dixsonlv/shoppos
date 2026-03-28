import React, { useState } from "react";
import { X, CreditCard, Banknote, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Order } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

interface PaymentSheetProps {
  order: Order;
  onClose: () => void;
  onComplete: (method?: string) => void;
}

type PaymentMethod = "card" | "cash" | "qr";

const cardTypes = ["Visa", "Mastercard", "UnionPay"];
const qrTypes = ["Alipay", "WeChat Pay", "PayNow"];

export const PaymentSheet: React.FC<PaymentSheetProps> = ({ order, onClose, onComplete }) => {
  const { t } = useLanguage();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cashAmount, setCashAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedSubMethod, setSelectedSubMethod] = useState("Visa");

  const numericCash = parseFloat(cashAmount) || 0;
  const changeDue = method === "cash" ? Math.max(0, numericCash - order.total) : 0;

  const handleKeypad = (val: string) => {
    if (val === "C") { setCashAmount(""); return; }
    if (val === "." && cashAmount.includes(".")) return;
    setCashAmount(prev => prev + val);
  };

  const getPaymentLabel = () => {
    if (method === "card") return selectedSubMethod;
    if (method === "qr") return selectedSubMethod;
    return "Cash";
  };

  const handlePay = async () => {
    if (method === "cash" && numericCash < order.total) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={() => onComplete(getPaymentLabel())}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-status-green-light flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-status-green" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">{t("payment_complete")}</h3>
          <p className="text-muted-foreground text-[13px] mb-1">${order.total.toFixed(2)} {t("paid_via")} {getPaymentLabel()}</p>
          {method === "cash" && changeDue > 0 && (
            <p className="text-lg font-bold text-status-green font-mono">{t("change")}: ${changeDue.toFixed(2)}</p>
          )}
          <Button className="w-full mt-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" size="xl" onClick={() => onComplete(getPaymentLabel())}>{t("done")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-lg font-bold text-foreground tracking-tight">{t("payment")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 text-center border-b border-border">
          <p className="section-label mb-1">{t("amount_due")}</p>
          <p className="text-3xl font-bold text-foreground tracking-tighter font-mono">${order.total.toFixed(2)}</p>
        </div>

        <div className="flex gap-2 p-5 border-b border-border">
          {([
            { id: "card" as const, icon: CreditCard, label: t("card") },
            { id: "cash" as const, icon: Banknote, label: t("cash") },
            { id: "qr" as const, icon: QrCode, label: "SGQR" },
          ]).map(m => (
            <button
              key={m.id}
              onClick={() => { setMethod(m.id); setCashAmount(""); setSelectedSubMethod(m.id === "card" ? "Visa" : m.id === "qr" ? "Alipay" : "Cash"); }}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-1.5 transition-all",
                method === m.id
                  ? "bg-status-blue-light border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-accent"
              )}
            >
              <m.icon className="h-5 w-5" />
              <span className="text-[11px] font-semibold">{m.label}</span>
            </button>
          ))}
        </div>

        {method === "cash" && (
          <div className="p-5 space-y-3">
            <div className="text-center">
              <p className="section-label mb-1">{t("cash_received")}</p>
              <p className="text-2xl font-bold text-foreground font-mono">${cashAmount || "0.00"}</p>
              {numericCash >= order.total && (
                <p className="text-[13px] text-status-green font-semibold mt-1 font-mono">{t("change")}: ${changeDue.toFixed(2)}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9",".","0","C"].map(key => (
                <button
                  key={key}
                  onClick={() => handleKeypad(key)}
                  className={cn(
                    "h-12 rounded-lg text-lg font-medium transition-colors",
                    key === "C" ? "bg-status-red-light text-destructive hover:bg-destructive/15" : "bg-accent text-foreground hover:bg-secondary"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map(amt => (
                <button
                  key={amt}
                  onClick={() => setCashAmount(amt.toFixed(2))}
                  className="flex-1 h-9 rounded-lg bg-accent text-[13px] font-semibold text-foreground hover:bg-secondary transition-colors font-mono"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {method === "card" && (
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              {cardTypes.map(ct => (
                <button
                  key={ct}
                  onClick={() => setSelectedSubMethod(ct)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border-1.5 text-[12px] font-semibold transition-all",
                    selectedSubMethod === ct ? "border-primary bg-status-blue-light text-primary" : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  {ct}
                </button>
              ))}
            </div>
            <div className="py-6 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">{t("tap_insert_swipe")}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Powered by Uniweb</p>
            </div>
          </div>
        )}

        {method === "qr" && (
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              {qrTypes.map(qt => (
                <button
                  key={qt}
                  onClick={() => setSelectedSubMethod(qt)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border-1.5 text-[12px] font-semibold transition-all",
                    selectedSubMethod === qt ? "border-primary bg-status-blue-light text-primary" : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  {qt}
                </button>
              ))}
            </div>
            <div className="py-4 text-center">
              <div className="w-32 h-32 bg-accent rounded-xl mx-auto mb-3 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground/20" />
              </div>
              <p className="text-[13px] text-muted-foreground">{t("scan_qr")} {selectedSubMethod}</p>
            </div>
          </div>
        )}

        <div className="p-5 border-t border-border">
          <Button
            size="xl"
            className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
            disabled={isProcessing || (method === "cash" && numericCash < order.total)}
            onClick={handlePay}
          >
            {isProcessing ? t("processing") : `${t("confirm_payment")} $${order.total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
