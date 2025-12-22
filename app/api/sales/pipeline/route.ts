import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url);

    const params: Record<string, string> = {};    

    const dateFrom = searchParams.get("date_from");
    if (dateFrom) {
      params.date_from = dateFrom;
    }

    const dateTo = searchParams.get("date_to");
    if (dateTo) {
      params.date_to = dateTo;
    }

    const assignedTo = searchParams.get("assigned_to");

    if (assignedTo) {
      params.assigned_to = assignedTo;
    }

    const res = await axiosClient.get("/pipelines", { params });

    return NextResponse.json(res.data);

  } catch (error: unknown) {

    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
      { status: 500 }
    );

  }
}

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const res = await axiosClient.post("/pipelines", body, {
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

