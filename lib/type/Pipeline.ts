import { StaticImageData } from "next/image";

export interface Company {
  id: string;
  name: string;
  company: string;
}

export interface Deal {
  id: string;
  deal_name: string;
  company: Company;
  amount: number;
  avatar: string;
  notes: string;
  client_account: string;
  expected_close_date: string;
  probability_of_close: number;
  is_delete: boolean;
  wonDate?: string;
  lostDate?: string;
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
  stageName: string;
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
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  image?: string | StaticImageData;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
}