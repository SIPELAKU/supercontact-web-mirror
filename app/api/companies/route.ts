import { NextResponse } from "next/server";
import companies from "@/lib/data/companies.json";

export async function GET() {
  return NextResponse.json({
    status: 200,
    message: "Success",
    data: companies,
  });
}
