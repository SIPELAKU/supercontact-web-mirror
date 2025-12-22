import { NextResponse } from "next/server";
import company from "@/lib/data/company.json";

export async function GET() {
  return NextResponse.json({
    status: 200,
    message: "Success",
    data: company,
  });
}
