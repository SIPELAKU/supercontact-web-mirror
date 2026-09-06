"use client";

import { AppInput } from "../ui/app-input";
import { AppTextarea } from "../ui/app-textarea";

/**
 * Terms & conditions and payment terms. Prefilled from the company defaults
 * (GET /quotations/defaults) on a new quotation and from the stored row on
 * an existing one; both are snapshotted on the quotation by the API.
 */
interface TermsCardProps {
  terms: string;
  paymentTerms: string;
  onTermsChange: (value: string) => void;
  onPaymentTermsChange: (value: string) => void;
  readOnly?: boolean;
}

export default function TermsCard({
  terms,
  paymentTerms,
  onTermsChange,
  onPaymentTermsChange,
  readOnly = false,
}: TermsCardProps) {
  return (
    <div className="bg-white p-6 space-y-4">
      <div>
        <h2 className="mb-3 text-base font-semibold">Syarat &amp; ketentuan</h2>
        <AppTextarea
          value={terms}
          onChange={(e) => onTermsChange(e.target.value)}
          placeholder="Syarat & ketentuan yang tercetak di quotation"
          isBgWhite
          disabled={readOnly}
        />
      </div>
      <div className="max-w-md">
        <AppInput
          label="Termin pembayaran"
          value={paymentTerms}
          onChange={(e) => onPaymentTermsChange(e.target.value)}
          placeholder="mis. 50% DP, pelunasan 14 hari setelah invoice"
          inputProps={{ maxLength: 255 }}
          isBgWhite
          height="48px"
          rounded="8px"
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
