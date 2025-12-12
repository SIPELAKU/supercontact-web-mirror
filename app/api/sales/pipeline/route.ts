import { NextResponse } from "next/server";
import axiosExternal from "@/lib/utils/axiosExternal";

export async function GET() {
  try {

    const res = await axiosExternal.get("/pipelines");

    return NextResponse.json(res.data);

  } catch (error: any) {

    console.error("API Error:", error.message);

    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
      { status: 500 }
    );
    
  }
}
