import axiosClient from "@/lib/utils/axiosClient";
import axios from "axios";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {

   const url = new URL(req.url);

    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";

    const params = {
      page,
      limit,
    };

    const res = await axiosClient.get("/products", { params });

    return NextResponse.json(res.data);

  } catch (error: unknown) {

    let message = "Unknown error";

    if (typeof error === "object" && error !== null && "message" in error) {
      message = String((error as { message: string }).message);
    }

    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
    
  }
}

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const res = await axiosClient.post("/products", body, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return NextResponse.json(res.data);

  } catch (err: unknown) {

    if (axios.isAxiosError(err)) {
      const backendErrors = err.response?.data?.error?.details.errors;

      if (Array.isArray(backendErrors)) {

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