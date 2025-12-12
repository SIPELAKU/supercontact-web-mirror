export function formatRupiah(amount: number | string): string {
  if (amount === null || amount === undefined) return "Rp. 0";

  const num = Number(amount);
  if (isNaN(num)) return "Rp. 0";

  return "Rp. " + num.toLocaleString("id-ID");
}
