import { NextResponse } from "next/server";
import axiosExternal from "@/lib/utils/axiosClient";

export async function GET(req: Request) {
  try {

    const res = await axiosExternal.get("/pipelines/active-users");

    return NextResponse.json(res.data);

  } catch (error: unknown) {

    return NextResponse.json(
      { error: "Failed to fetch active user" },
      { status: 500 }
    );

  }
}