import { StaticImageData } from "next/image";

export type Deal = {
  id: string
  deal_name: string
  company: {id: string, company: string, name: string}
  amount: number
  avatar: string
  notes: string
  client_account: string
  expected_close_date?: string
  wonDate?: string
  lostDate?: string
  probability_of_close: number
  is_delete: boolean
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
  company: {id: string, company: string, name: string}
  amount: number
  avatar: string
  notes: string
  client_account: string
  expected_close_date?: string
  wonDate?: string
  lostDate?: string
  probability_of_close: number
  is_delete: boolean
}

export interface AddDealModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  image?: string | StaticImageData;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
}