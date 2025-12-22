import axiosClient from "@/lib/utils/axiosClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {

    const res = await axiosClient.get("/pipelines/active-users");

    return NextResponse.json(res.data);

  } catch (error: unknown) {

    return NextResponse.json(
      { error: "Failed to fetch active user" },
      { status: 500 }
    );

  }
}