"use client";

interface SummaryCardProps {
  subtotal: number;
  discountAmount: number;
  taxEnabled: boolean;
  taxAmount: number;
  grandTotal: number;
  setTaxEnabled: (value: boolean) => void;
}


export default function SummaryCard({
  subtotal,
  discountAmount,
  taxEnabled,
  taxAmount,
  grandTotal,
  setTaxEnabled,
}: SummaryCardProps) {
  return (
    <section className="flex justify-end">
      <aside className="w-full md:w-96 space-y-3 p-6">
        <div className="flex justify-between items-center">
          <span className="text-foreground font-medium">Subtotal:</span>
          <span className="text-foreground font-semibold">
            Rp {subtotal.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-foreground font-medium">Discount:</span>
          <span className="text-foreground font-semibold">
            Rp {discountAmount.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-foreground font-medium">Tax:</span>
          <span className="text-foreground font-semibold">11%</span>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center">
            <span className="text-foreground font-bold text-lg">Grand Total:</span>
            <span className="text-foreground font-bold text-lg">
              Rp {grandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </aside>
    </section>
  );
}
