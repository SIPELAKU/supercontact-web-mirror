import Leads from "@/public/icons/leads.svg"
import LeadsActive from "@/public/icons/leads-active.svg"

import Pipeline from "@/public/icons/pipeline.svg"
import PipelineActive from "@/public/icons/pipeline-active.svg"

import Product from "@/public/icons/product.svg"
import ProductActive from "@/public/icons/product-active.svg"

import Quotations from "@/public/icons/quotations.svg"
import QuotationsActive from "@/public/icons/quotations-active.svg"

import Deals from "@/public/icons/deals.svg"
import DealsActive from "@/public/icons/deals-active.svg"

import Marketing from "@/public/icons/marketing.svg"
import MarketingActive from "@/public/icons/marketing-active.svg"

import Settings from "@/public/icons/settings.svg"
import SettingsActive from "@/public/icons/settings-active.svg"


export const navigation = [
  {
    name: "Leads",
    icon: Leads,
    activeIcon: LeadsActive,
    href: "/lead-management",
  },
  {
    name: "Pipeline",
    icon: Pipeline,
    activeIcon: PipelineActive,
    href: "/sales/pipeline",
  },
  {
    name: "Quotations",
    icon: Quotations,
    activeIcon: QuotationsActive,
    href: "/sales/quotation",
  },
  {
    name: "Product",
    icon: Product,
    activeIcon: ProductActive,
    href: "/sales/product",
  },
  {
    name: "Deals",
    icon: Deals,
    activeIcon: DealsActive,
    href: "/deals",
  },
  {
    name: "Marketing",
    icon: Marketing,
    activeIcon: MarketingActive,
    href: "/marketing",
  },
  {
    name: "Settings",
    icon: Settings,
    activeIcon: SettingsActive,
    href: "/settings",
  },
]