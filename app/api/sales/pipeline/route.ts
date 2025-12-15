import axios from "axios";       
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

  } catch (error: any) {

    console.error("API Error:", error.message);

    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
      { status: 500 }
    );
    
  }
}

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const res = await axiosExternal.post("/pipelines", body, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    return NextResponse.json(res.data);

} catch (err: unknown) {

  if (axios.isAxiosError(err)) {
    const backendErrors = err.response?.data?.error?.details.errors;

    if (Array.isArray(backendErrors)) {
      // console.error(
      //   "Pipeline Validation Errors:",
      //   JSON.stringify(backendErrors, null, 2)
      // );

      return NextResponse.json(
        { 
          error: "Validation failed",
          details: backendErrors 
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { 
        error: err.message || "Failed to post pipeline" 
      },
      { status: err.response?.status ?? 500 }
    );
  }

  return NextResponse.json(
    { error: "Unknown server error" },
    { status: 500 }
  );
}

}

