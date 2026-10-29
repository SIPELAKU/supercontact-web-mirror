"use client";

import { useMemo, useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { Package, X } from "lucide-react";

import { AppDatePicker } from "@/components/ui/app-datepicker";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable } from "@/components/ui/super-table";
import type { MRT_ColumnDef } from "@/components/ui/super-table/types";
import type { ProductItem } from "@/lib/api/sales-dashboard";
import { useProductPerformancePage } from "@/lib/hooks/useSalesDashboard";
import {
  PRODUCT_RANGE_OPTIONS,
  productRangeParams,
  productTableTotal,
  type ProductRange,
} from "@/components/dashboard/productPerformance";

const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value ?? 0);

interface ProductPerformanceDetailModalProps {
  open: boolean;
  onClose: () => void;
  /** The card's period when the modal was opened; the modal then has its own. */
  initialRange: ProductRange;
  initialCustom: [Date | null, Date | null];
}

/**
 * Every product sold in Won deals for a period, a page at a time from the API.
 * Remounted on each open (the card gives it a new key), so it starts from the
 * card's period; changing it here leaves the card as it is.
 */
export default function ProductPerformanceDetailModal({
  open,
  onClose,
  initialRange,
  initialCustom,
}: ProductPerformanceDetailModalProps) {
  const [range, setRange] = useState<ProductRange>(initialRange);
  const [custom, setCustom] = useState<[Date | null, Date | null]>(initialCustom);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const params = productRangeParams(range, custom);
  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } =
    useProductPerformancePage(params, page, limit, open);

  // Per product: units sold and Won deals only.
  const columns = useMemo<MRT_ColumnDef<ProductItem>[]>(
    () => [
      { accessorKey: "product_name", header: "Product" },
      {
        accessorKey: "quantity_sold",
        header: "Units Sold",
        Cell: ({ cell }) => formatCount(cell.getValue<number>()),
      },
      {
        accessorKey: "total_deals",
        header: "Won Deals",
        Cell: ({ cell }) => formatCount(cell.getValue<number>()),
      },
    ],
    []
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, p: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Product Performance</Typography>
          <Typography variant="body2" color="text.secondary">Units sold in Won deals</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 0 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5} mb={2}>
          <Box width={180}>
            <AppSelect
              value={range}
              onChange={(e: any) => {
                setRange(e.target.value as ProductRange);
                setPage(1);
              }}
              isBgWhite
              options={PRODUCT_RANGE_OPTIONS}
              // Same height as the date picker beside it
              height="48px"
            />
          </Box>
          {range === "custom" && (
            <Box width={250}>
              <AppDatePicker
                mode="range"
                placeholder="Select date range"
                isBgWhite
                value={custom}
                maxDate={new Date()}
                onChange={(val) => {
                  if (Array.isArray(val)) {
                    setCustom([val[0], val[1]]);
                    setPage(1);
                  }
                }}
              />
            </Box>
          )}
        </Box>

        <SuperTable<ProductItem>
          entityLabel="product"
          tableId="product-performance-detail"
          data={data?.items ?? []}
          columns={columns}
          rowCount={productTableTotal(data)}
          // The first load, and a new page or period (the previous rows stay
          // as a placeholder until then), show the skeleton.
          isLoading={isLoading || (isFetching && isPlaceholderData)}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          // A new period starts again at page 1.
          resetPageKey={JSON.stringify(params)}
          manualPagination
          manualSorting={false}
          manualFiltering={false}
          onStateChange={(state) => {
            if (state.pagination.pageSize !== limit) {
              setLimit(state.pagination.pageSize);
              setPage(1);
            } else if (state.pagination.pageIndex + 1 !== page) {
              setPage(state.pagination.pageIndex + 1);
            }
          }}
          renderEmptyState={() => (
            <EmptyState
              icon={Package}
              title="No products sold"
              description="No product was sold in Won deals in this period."
            />
          )}
          features={{
            pagination: "pages",
            pageSizeOptions: [10, 25, 50],
            globalFilter: false,
            columnFilters: false,
            sorting: false,
            rowSelection: "none",
            columnVisibility: false,
            densityToggle: false,
            fullScreenToggle: false,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
