import type { Product } from "@/lib/store/product";

export interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The row being edited - the modal's single source of truth. null/undefined = create. */
  product?: Product | null;
  /** Fired after a successful create or update, so the page can reset its lazy list. */
  onSaved?: () => void;
}
