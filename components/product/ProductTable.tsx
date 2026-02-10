"use client";

import { AddProductModal } from "@/components/product/AddProductModal";
import { Button } from "@/components/ui/button";
import { useConfirmation } from "@/components/ui/confirm-modal";
import { formatRupiah } from "@/lib/helper/currency";
import { Product, useGetProductStore } from "@/lib/store/product";
import Pencil from "@/public/icons/pencil.png";
import Trash from "@/public/icons/trash.png";
import { Plus, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { AppInput } from "../ui/app-input";
import { AppButton } from "../ui/app-button";
import { AppButtonIcon } from "../ui/app-button-icon";
import { Spinner } from "../ui/spinner";
import { Box, CircularProgress } from "@mui/material";
import { notify } from "@/lib/notifications";

export default function ProductTable() {
  const {
    listProduct,
    pagination,
    setLimit,
    setPage,
    loading,
    setEditId,
    deleteProduct,
    searchQuery,
    setSearchQuery,
  } = useGetProductStore();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { showConfirmation } = useConfirmation();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8">
      <AddProductModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 px-4 pt-5 w-full">
        <div className="lg:w-[50%] w-full">
          <AppInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name and sku"
            startIcon={<Search className="h-5 w-5 text-gray-400 mr-2" />}
            isBgWhite
          />
        </div>

        <AppButton
          onClick={() => setIsModalOpen(!isModalOpen)}
          variantStyle="primary"
          color="primary"
          startIcon={<Plus className="h-4 w-4" />}
        >
          Add New Product
        </AppButton>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 mx-4 mb-4">
        <Table>
          <TableHead>
            <TableRow className="bg-[#EEF2FD]!">
              <TableCell>
                <span className="text-[#6B7280]">Product Name</span>
              </TableCell>
              <TableCell>
                <span className="text-[#6B7280]">SKU</span>
              </TableCell>
              <TableCell>
                <span className="text-[#6B7280]">Price</span>
              </TableCell>
              <TableCell>
                <span className="text-[#6B7280]">Tax Rate</span>
              </TableCell>
              <TableCell>
                <span className="text-[#6B7280]">Actions</span>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ p: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 120,
                    }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : listProduct.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <div className="py-8 text-gray-500">No data available</div>
                </TableCell>
              </TableRow>
            ) : (
              listProduct.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div
                      className="truncate font-medium text-gray-900 max-w-50 xl:max-w-75"
                      title={product.product_name}
                    >
                      {product.product_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="truncate font-medium text-gray-700 max-w-37.5"
                      title={product.sku}
                    >
                      {product.sku}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      {formatRupiah(product.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {product.tax_rate}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <AppButtonIcon
                        onClick={() => {
                          setIsModalOpen(!isModalOpen);
                          setEditId(product.id);
                        }}
                        icon={
                          <Image
                            src={Pencil}
                            height={24}
                            width={24}
                            alt="edit"
                          />
                        }
                        color="primary"
                        variantStyle="text"
                      />
                      <AppButtonIcon
                        onClick={() => {
                          const data = listProduct.filter(
                            (item) => item.id === product.id,
                          );
                          showConfirmation({
                            type: "delete",
                            title: "Delete Product",
                            message: `Are you sure you want to delete "${data[0].product_name}"? This action cannot be undone.`,
                            confirmText: "Delete",
                            cancelText: "Cancel",
                            onConfirm: async () => {
                              await new Promise((resolve) =>
                                setTimeout(resolve, 1000),
                              );
                              const res = await deleteProduct(product.id);
                              if (res.success) {
                                notify.success("Product Deleted", { description: `Product "${product.product_name}" has been successfully deleted.` });
                              } else {
                                notify.error("Failed to Delete", { description: res.error || "An error occurred while deleting the product." });
                              }
                            },
                          });
                        }}
                        icon={
                          <Image
                            src={Trash}
                            height={24}
                            width={24}
                            alt="delete"
                          />
                        }
                        color="danger"
                        variantStyle="text"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={(_, page) => setPage(page + 1)}
          onRowsPerPageChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          rowsPerPageOptions={[10, 15, 20]}
          slotProps={{
            select: {
              inputProps: { "aria-label": "rows per page" },
            },
          }}
        />
      </div>
    </div>
  );
}
