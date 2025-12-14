import { NextResponse } from "next/server";
import axiosExternal from "@/lib/utils/axiosExternal";

export async function GET(req: Request) {
  try {

   const url = new URL(req.url);

    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";

    const params = {
      page,
      limit,
    };

    const res = await axiosExternal.get("/products", { params });

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