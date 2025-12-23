import axiosClient from "@/lib/utils/axiosClient";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        const res = await axiosClient.delete(`/products/${id}`);

        return NextResponse.json(res.data);

    } catch (error: unknown) {

        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );

    }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        const res = await axiosClient.put(`/products/${id}`, body, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        return NextResponse.json(res.data);

    } catch (error: unknown) {

        return NextResponse.json(
            { error: "Failed to patch stage pipeline" },
            { status: 500 }
        );

    }
}