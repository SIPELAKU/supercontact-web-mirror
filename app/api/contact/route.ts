import axiosClient from "@/lib/utils/axiosClient";
import axios from "axios";
import { cookies } from "next/headers";
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

    const res = await axiosClient.get("/contacts", { params });    

    return NextResponse.json(res.data);

  } catch (error: unknown) {

    let message = "Unknown error";

    if (typeof error === "object" && error !== null && "message" in error) {
      message = String((error as { message: string }).message);
    }
    console.error("API Error:", message);

    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
    
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contacts`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(res.data, { status: res.status });

  } catch (error) {
    console.error("POST contact error:", error);

    // ✅ HANDLE AXIOS ERROR
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || {
          error: { message: "Upstream API error" },
        },
        {
          status: error.response?.status || 500,
        }
      );
    }

    // fallback error
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, ...payload } = body;

    if (!id) {
      return NextResponse.json(
        { error: { message: "Contact ID is required" } },
        { status: 400 }
      );
    }

    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(res.data, { status: res.status });

  } catch (error) {
    console.error("PUT contact error:", error);

    // ✅ Forward axios error
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || {
          error: { message: "Upstream API error" },
        },
        {
          status: error.response?.status || 500,
        }
      );
    }

    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: { message: "Contact ID is required" } },
        { status: 400 }
      );
    }

    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    console.error("DELETE contact error:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || {
          error: { message: "Upstream API error" },
        },
        {
          status: error.response?.status || 500,
        }
      );
    }

    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

