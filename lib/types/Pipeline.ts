import { StaticImageData } from "next/image";

export interface Company {
  id: string;
  name: string;
  company: string;
}

export interface Product {
  id: string;
  product_name: string;
  sku: string;
  price: string;
}

export interface Deal {
  id: string;
  deal_name: string;
  company: Company;
  product?: Product;
  quantity?: number;
  amount: number;
  avatar: string;
  avatar_initial?: string;
  notes: string;
  client_account: string;
  expected_close_date: string;
  probability_of_close: number;
  is_delete: boolean;
  wonDate?: string;
  lostDate?: string;
  /** The API's `status === "expired"`. */
  is_expired?: boolean;
  /** Expired deals only: the API's `days_until_deletion` (0 = today). */
  days_until_deletion?: number;
}

interface Stats {
  total_pipeline: number
  avg_pipeline: number
  winrate_pipeline: number
}

export type Stage = {
  page: number
  stats: Stats
  total: number
  total_pages: number
  pipelines: Deal[]
}

export interface DealCardProps {
  id: string
  deal_name: string
  company: { id: string, company: string, name: string }
  product?: Product
  quantity?: number
  amount: number
  avatar: string
  notes: string
  client_account: string
  expected_close_date?: string
  avatar_initial?: string
  wonDate?: string
  lostDate?: string
  probability_of_close: number
  is_delete: boolean
  is_expired?: boolean
  days_until_deletion?: number
  stageName: string;
  /** Just moved to another stage, waiting for the board to reload. */
  isSaving?: boolean
  /** Just moved: shown for a moment where it landed. */
  isHighlighted?: boolean
}

export interface AddDealModalProps {
  open: boolean;
  id?: string;
  onOpenChange: (open: boolean) => void;
}

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}

export interface FilterBarProps {
  filters: FilterConfig[]
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  image?: string | StaticImageData;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
  /** Primary action(s) for the page (e.g. a "Create" button), rendered
   * top-right of the header next to the title. Takes precedence over
   * `image` when both are supplied - a header shows one or the other. */
  actions?: React.ReactNode;
}
