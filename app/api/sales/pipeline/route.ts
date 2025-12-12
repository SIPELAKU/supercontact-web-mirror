import { NextResponse } from "next/server";
import axiosExternal from "@/lib/utils/axiosExternal";

export async function GET() {
  try {

    const res = await axiosExternal.get("/pipelines");

    return NextResponse.json(res.data);

  } catch (error: unknown) {

    let message = "Unknown error";

    if (typeof error === "object" && error !== null && "message" in error) {
      message = String((error as { message: string }).message);
    }
    console.error("API Error:", message);

    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
      { status: 500 }
    );
    
  }
}
