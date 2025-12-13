import { NextResponse } from "next/server";
import roles from "@/lib/data/roles.json";

export async function GET() {
  return NextResponse.json({
    status: 200,
    message: "Success",
    data: roles,
  });
}
