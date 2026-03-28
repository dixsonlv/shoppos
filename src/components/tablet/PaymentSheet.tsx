import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

interface PaymentSheetProps {
  order: Order;
  onClose: () => void;
  onComplete: (method?: string) => void;
}

export const PaymentSheet: React.FC<PaymentSheetProps> = ({ order, onClose, onComplete }) => {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
        onClick={() => onComplete()}>
        <div className="bg-card rounded-2xl shadow-2xl p-8 w-[360px] text-center"
          onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-pos-pay/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-pos-pay" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{t("payment_complete")}</h3>
          <p className="text-muted-foreground text-sm mb-6">
            ${order.total.toFixed(2)}
          </p>
          <Button
            onClick={() => onComplete()}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-base font-semibold"
          >
            {t("done")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl p-8 w-[360px] text-center"
        onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-foreground mb-2">{t("payment")}</h3>
        <p className="text-sm text-muted-foreground mb-1">{t("amount_due")}</p>
        <p className="text-4xl font-bold text-primary mb-8 font-mono">
          ${order.total.toFixed(2)}
        </p>
        <Button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-lg font-bold active:scale-95 transition-transform"
        >
          {isProcessing ? t("processing") : `${t("confirm_payment")} $${order.total.toFixed(2)}`}
        </Button>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
};
