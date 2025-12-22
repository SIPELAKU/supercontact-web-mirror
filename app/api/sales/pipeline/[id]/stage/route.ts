import { NextResponse } from "next/server";
import axiosExternal from "@/lib/utils/axiosClient";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { deal_stage } = await req.json();

    const res = await axiosExternal.patch(`/pipelines/${id}/stage`, { deal_stage });
        
    return NextResponse.json(res.data);

  } catch (error: unknown) {
    
    return NextResponse.json(
      { error: "Failed to patch stage pipeline" },
      { status: 500 }
    );

  }
}