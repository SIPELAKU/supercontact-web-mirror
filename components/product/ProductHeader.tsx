"use client";

import Link from "next/link";
import { FolderTree, Ruler } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { usePermission } from "@/lib/hooks/usePermission";

export default function ProductHeader() {
  const { can } = usePermission();
  // The managers are gated on `sales:config:manage` (Admin/Manager); a Staff
  // user sees the catalogue but not the shortcuts to configure it.
  const canManage = can("sales:config:manage");

  return (
    <PageHeader
      title="Products"
      description="Katalog produk, kategori dan satuan"
      breadcrumbs={[{ label: "Sales" }, { label: "Product Catalog" }]}
      actions={
        canManage ? (
          <div className="flex flex-wrap gap-2">
            <Link href="/settings/sales/product-categories">
              <AppButton variantStyle="outline" startIcon={<FolderTree size={16} />}>
                Kategori Produk
              </AppButton>
            </Link>
            <Link href="/settings/sales/units">
              <AppButton variantStyle="outline" startIcon={<Ruler size={16} />}>
                Satuan
              </AppButton>
            </Link>
          </div>
        ) : undefined
      }
    />
  );
}
