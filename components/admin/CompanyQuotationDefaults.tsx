"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { fetchMyCompany, updateCompanyGeneral } from "@/lib/api/company-profile";
import type { CompanyGeneral } from "@/lib/types/company-profile";

/**
 * The company's quotation defaults: currency (IDR only in Phase 0), the PPN
 * rate, whether catalogue prices already include it, and the terms printed
 * on every new quotation. These are SNAPSHOTTED onto a quotation when it is
 * created or its draft is updated - changing them here touches only
 * quotations made afterwards, never the ones already sent.
 *
 * Admin only: GET /companies and the PATCH both require `companies`.
 */
interface DefaultsForm {
  taxRate: string;
  pricesIncludeTax: boolean;
  terms: string;
  paymentTerms: string;
}

const TERMS_MAX = 4000;
const PAYMENT_TERMS_MAX = 255;

function formFromCompany(company: CompanyGeneral): DefaultsForm {
  const rate = Number(company.default_tax_rate);
  return {
    taxRate: Number.isFinite(rate) ? String(rate) : "11",
    pricesIncludeTax: !!company.prices_include_tax,
    terms: company.quotation_terms ?? "",
    paymentTerms: company.quotation_payment_terms ?? "",
  };
}

/** "11" / "12.5" -> "11.00" / "12.50"; null when not a percentage. */
export function normaliseTaxRate(value: string): string | null {
  const trimmed = value.trim().replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0 || num > 100) return null;
  return num.toFixed(2);
}

export default function CompanyQuotationDefaults() {
  const { getToken } = useAuth();
  const [company, setCompany] = useState<CompanyGeneral | null>(null);
  const [form, setForm] = useState<DefaultsForm>({
    taxRate: "11",
    pricesIncludeTax: false,
    terms: "",
    paymentTerms: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DefaultsForm, string>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const token = await getToken();
      const data = await fetchMyCompany(token);
      setCompany(data);
      setForm(formFromCompany(data));
    } catch (err: any) {
      setLoadError(err?.message || "Gagal memuat pengaturan quotation");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const saved = useMemo(() => (company ? formFromCompany(company) : null), [company]);
  const dirty =
    !!saved &&
    (saved.taxRate !== form.taxRate ||
      saved.pricesIncludeTax !== form.pricesIncludeTax ||
      saved.terms !== form.terms ||
      saved.paymentTerms !== form.paymentTerms);

  const validate = (): boolean => {
    const next: Partial<Record<keyof DefaultsForm, string>> = {};
    if (normaliseTaxRate(form.taxRate) === null) {
      next.taxRate = "Tarif PPN harus 0-100 dengan maksimal 2 desimal";
    }
    if (form.terms.length > TERMS_MAX) {
      next.terms = `Maksimal ${TERMS_MAX} karakter`;
    }
    if (form.paymentTerms.length > PAYMENT_TERMS_MAX) {
      next.paymentTerms = `Maksimal ${PAYMENT_TERMS_MAX} karakter`;
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!company || !validate()) return;
    setSaving(true);
    try {
      const token = await getToken();
      const updated = await updateCompanyGeneral(token, {
        // `name` is required by the API even when only defaults change.
        name: company.name,
        default_currency: company.default_currency || "IDR",
        default_tax_rate: normaliseTaxRate(form.taxRate) ?? "11.00",
        prices_include_tax: form.pricesIncludeTax,
        quotation_terms: form.terms.trim() ? form.terms : null,
        quotation_payment_terms: form.paymentTerms.trim() ? form.paymentTerms : null,
      });
      setCompany(updated);
      setForm(formFromCompany(updated));
      notify.success("Pengaturan quotation disimpan", {
        description: "Berlaku untuk quotation yang dibuat setelah ini; quotation lama tidak berubah.",
      });
    } catch (err: any) {
      notify.error("Gagal menyimpan", { description: err?.message || "Terjadi kesalahan" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-0!">
        <div className="p-5">
          <Typography className="text-base! font-semibold!">Pengaturan Quotation</Typography>
          <Typography className="mt-1 text-xs! text-slate-500!">
            Nilai bawaan untuk quotation baru. Quotation yang sudah dibuat menyimpan nilainya sendiri.
          </Typography>
        </div>

        <Divider />

        <div className="p-5 space-y-4">
          {loadError ? (
            <div className="space-y-3">
              <Typography className="text-sm! text-red-500!">{loadError}</Typography>
              <AppButton variantStyle="outline" size="small" onClick={load}>
                Coba lagi
              </AppButton>
            </div>
          ) : (
            <>
              <AppInput
                label="Mata uang default"
                value={company?.default_currency || "IDR"}
                disabled
                isBgWhite
                helperText="Hanya IDR yang didukung saat ini"
              />

              <AppInput
                label="Tarif PPN default (%)"
                type="number"
                value={form.taxRate}
                onChange={(e) => {
                  setForm((p) => ({ ...p, taxRate: e.target.value }));
                  if (fieldErrors.taxRate) setFieldErrors((p) => ({ ...p, taxRate: undefined }));
                }}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                endIcon={<span className="text-gray-500 font-medium">%</span>}
                isBgWhite
                disabled={loading || saving}
                error={!!fieldErrors.taxRate}
                helperText={fieldErrors.taxRate}
              />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <Typography className="text-sm! font-medium!">Harga sudah termasuk PPN</Typography>
                  <Typography className="text-xs! text-slate-500!">
                    Nyalakan bila harga katalog sudah memuat PPN.
                  </Typography>
                </div>
                <Switch
                  checked={form.pricesIncludeTax}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, pricesIncludeTax: checked }))}
                  disabled={loading || saving}
                  aria-label="Harga sudah termasuk PPN"
                />
              </div>

              <AppTextarea
                label="Syarat & ketentuan quotation"
                value={form.terms}
                onChange={(e) => {
                  setForm((p) => ({ ...p, terms: e.target.value }));
                  if (fieldErrors.terms) setFieldErrors((p) => ({ ...p, terms: undefined }));
                }}
                placeholder="Dicetak di setiap quotation baru"
                rows={4}
                isBgWhite
                disabled={loading || saving}
                error={!!fieldErrors.terms}
                helperText={fieldErrors.terms ?? `${form.terms.length}/${TERMS_MAX}`}
              />

              <AppInput
                label="Termin pembayaran"
                value={form.paymentTerms}
                onChange={(e) => {
                  setForm((p) => ({ ...p, paymentTerms: e.target.value }));
                  if (fieldErrors.paymentTerms) setFieldErrors((p) => ({ ...p, paymentTerms: undefined }));
                }}
                placeholder="mis. 50% DP, pelunasan 14 hari setelah invoice"
                inputProps={{ maxLength: PAYMENT_TERMS_MAX }}
                isBgWhite
                disabled={loading || saving}
                error={!!fieldErrors.paymentTerms}
                helperText={fieldErrors.paymentTerms}
              />

              <div className="flex justify-end gap-2 pt-2">
                <AppButton
                  variantStyle="outline"
                  color="gray"
                  size="small"
                  onClick={() => {
                    if (saved) setForm(saved);
                    setFieldErrors({});
                  }}
                  disabled={!dirty || saving}
                >
                  Batal
                </AppButton>
                <AppButton
                  size="small"
                  onClick={handleSave}
                  isLoading={saving}
                  disabled={loading || saving || !dirty}
                >
                  Simpan
                </AppButton>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
