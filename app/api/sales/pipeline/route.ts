import { NextResponse } from "next/server";
import axiosExternal from "@/lib/utils/axiosExternal";

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url);

    const params: Record<string, string> = {};

    if (searchParams.get("date_from")) {
      params.date_from = searchParams.get("date_from")!;
    }

    if (searchParams.get("date_to")) {
      params.date_to = searchParams.get("date_to")!;
    }

    const res = await axiosExternal.get("/pipelines", { params });

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

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const res = await axiosExternal.post("/pipelines", body);
    
    return NextResponse.json(res.data);

  } catch (error: unknown) {    
    let message = "Unknown error";

    if (typeof error === "object" && error !== null && "message" in error) {
      message = String((error as { message: string }).message);
    }
    console.error("API Error:", message);

    return NextResponse.json(
      { error: "Failed to post pipeline" },
      { status: 500 }
    );
    
  }
}

