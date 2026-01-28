"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchQuotationById } from "@/lib/api/quotations";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import { formatRupiah } from "@/lib/helper/currency";
import { formatMDY } from "@/lib/helper/date";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function QuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const quotationId = params.id as string;

    const [quotation, setQuotation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadQuotation = async () => {
            try {
                setLoading(true);
                const token = await getToken();
                const response = await fetchQuotationById(token, quotationId);
                setQuotation(response.data || response);
            } catch (err: any) {
                console.error("Error fetching quotation:", err);
                setError(err.message || "Failed to load quotation");
            } finally {
                setLoading(false);
            }
        };

        if (quotationId) {
            loadQuotation();
        }
    }, [quotationId, getToken]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#5479EE]" />
                </div>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="p-6">
                <PageHeader
                    title="Quotation Not Found"
                    breadcrumbs={[
                        { label: "Sales" },
                        { label: "Quotation" },
                        { label: "Detail" },
                    ]}
                />
                <Card className="mt-4">
                    <CardContent className="p-6 text-center text-red-600">
                        {error || "Quotation not found"}
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <Link href="/sales/quotation">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Quotations
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate totals
    const subtotal = quotation.quotation_items?.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.product.price),
        0
    ) || 0;

    const discountAmount = quotation.quotation_items?.reduce(
        (sum: number, item: any) => sum + ((item.quantity * item.product.price * item.discount) / 100),
        0
    ) || 0;

    const taxAmount = (subtotal - discountAmount) * 0.21; // Assuming 21% tax
    const grandTotal = quotation.grand_total || (subtotal - discountAmount + taxAmount);

    return (
        <div className="p-6">
            <PageHeader
                title="Quotation Details"
                breadcrumbs={[
                    { label: "Sales" },
                    { label: "Quotation" },
                    { label: quotation.quotation_number || "Detail" },
                ]}
            />


            {/* Header Actions */}
            <div className="flex justify-between items-center mt-4 mb-6">
                <Link href="/sales/quotation">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Quotations
                    </Button>
                </Link>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="h-11 px-8 rounded-xl border-gray-300 text-gray-600"
                        onClick={() => router.push(`/sales/quotation/${quotationId}/edit`)}
                    >
                        Edit
                    </Button>
                    <Button
                        className="h-11 px-8 rounded-xl bg-[#5479EE] text-white hover:bg-[#4364d1]"
                        onClick={() => window.print()}
                    >
                        Print / Download
                    </Button>
                </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-gray-300 p-6 bg-white">
                {/* Quotation Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {quotation.quotation_title || "Quotation"}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {quotation.quotation_number}
                        </p>
                    </div>
                    <div className="text-right">
                        <span
                            className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${quotation.quotation_status === "Accepted"
                                ? "bg-green-100 text-green-800"
                                : quotation.quotation_status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                        >
                            {quotation.quotation_status}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                            Expires: {formatMDY(quotation.expire_date)}
                        </p>
                    </div>
                </div>

                <Divider className="my-6" />

                {/* Client Information */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Client Name</p>
                            <p className="font-medium text-gray-900">{quotation.lead?.contact?.name || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Company</p>
                            <p className="font-medium text-gray-900">{quotation.lead?.contact?.company || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{quotation.lead?.contact?.email || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{quotation.lead?.contact?.phone_number || "-"}</p>
                        </div>
                    </div>
                </div>

                <Divider className="my-6" />

                {/* Products/Services Table */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Products & Services</h2>
                    <Table>
                        <TableHead>
                            <TableRow className="bg-[#EEF2FD]">
                                <TableCell><span className="text-[#6B7280]">Product</span></TableCell>
                                <TableCell><span className="text-[#6B7280]">SKU</span></TableCell>
                                <TableCell align="right"><span className="text-[#6B7280]">Quantity</span></TableCell>
                                <TableCell align="right"><span className="text-[#6B7280]">Unit Price</span></TableCell>
                                <TableCell align="right"><span className="text-[#6B7280]">Discount</span></TableCell>
                                <TableCell align="right"><span className="text-[#6B7280]">Total</span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {quotation.quotation_items?.map((item: any, index: number) => {
                                const itemTotal = item.quantity * item.product.price;
                                const itemDiscount = (itemTotal * item.discount) / 100;
                                const itemFinal = itemTotal - itemDiscount;

                                return (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.product.product_name}</p>
                                                {item.notes && (
                                                    <p className="text-sm text-gray-500">{item.notes}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-700">{item.product.sku}</TableCell>
                                        <TableCell align="right" className="text-gray-900">{item.quantity}</TableCell>
                                        <TableCell align="right" className="text-gray-900">
                                            {formatRupiah(item.product.price)}
                                        </TableCell>
                                        <TableCell align="right" className="text-gray-900">{item.discount}%</TableCell>
                                        <TableCell align="right" className="font-medium text-gray-900">
                                            {formatRupiah(itemFinal)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <Divider className="my-6" />

                {/* Summary */}
                <div className="flex justify-end">
                    <div className="w-full max-w-md space-y-3">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span className="font-medium">{formatRupiah(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Discount</span>
                            <span className="font-medium text-red-600">-{formatRupiah(discountAmount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Tax (21%)</span>
                            <span className="font-medium">{formatRupiah(taxAmount)}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                            <span>Grand Total</span>
                            <span>{formatRupiah(grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {quotation.notes && (
                    <>
                        <Divider className="my-6" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
