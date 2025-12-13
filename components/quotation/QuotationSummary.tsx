"use client";

import { Switch } from "@/components/ui-mui/switch";

interface SummaryCardProps {
  subtotal: number;
  discount: number;
  discountAmount: number;
  taxEnabled: boolean;
  taxAmount: number;
  grandTotal: number;
  setDiscount: (value: number) => void;
  setTaxEnabled: (value: boolean) => void;
}


export default function SummaryCard({
  subtotal,
  discount,
  discountAmount,
  taxEnabled,
  taxAmount,
  grandTotal,
  setDiscount,
  setTaxEnabled,
}: SummaryCardProps) {
  return (
    <section className="flex justify-end">
      <aside className="w-full md:w-96 space-y-3 p-6">
        <div className="flex justify-between items-center">
          <span className="text-foreground font-medium">Subtotal:</span>
          <span className="text-foreground font-semibold">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-foreground font-medium">Discount:</span>
          <span className="text-foreground font-semibold">-${discount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-foreground font-medium">Tax:</span>
          <span className="text-foreground font-semibold">21%</span>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center">
            <span className="text-foreground font-bold text-lg">Grand Total:</span>
            <span className="text-foreground font-bold text-lg">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </section>
  );
}
