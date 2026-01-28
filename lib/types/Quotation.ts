export interface ItemRow {
  product_id: string
  title: string
  sku: string
  discount: number
  desc: string
  qty: number
  unitPrice: number
}

export type QuotationSummaryProps = {
  subtotal: number
  discount: number
  discountAmount: number
  taxEnabled: boolean
  taxAmount: number
  grandTotal: number
  setDiscount: (value: number) => void
  setTaxEnabled: (value: boolean) => void
}

export interface QuotationItem {
  title: string
  desc: string
  qty: number
  unitPrice: number
}

export interface ProductsServicesTableProps {
  items: QuotationItem[]
  updateQty: (index: number, qty: number) => void
  removeItem: (index: number) => void
  addItem: () => void
}

export interface QuotationNotesProps {
  notes: string
  onChange: (value: string) => void
}
