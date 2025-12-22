import { NextResponse } from "next/server";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { deal_stage } = await req.json();

    const res = await axiosClient.patch(`/pipelines/${id}/stage`, { deal_stage });
        
    return NextResponse.json(res.data);

  } catch (error: unknown) {
    
    return NextResponse.json(
      { error: "Failed to patch stage pipeline" },
      { status: 500 }
    );

  }
}