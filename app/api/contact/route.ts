import { NextResponse } from "next/server";
import { DataContact } from "@/data/dummy";

export function GET() {
  return NextResponse.json({
    status: "success",
    data: DataContact,
  });
}

// ADD NEW CONTACT
export async function POST(request: Request) {
  const body = await request.json();
  DataContact.unshift(body);
  return NextResponse.json({ message: "Contact added", data: body });
}

// EDIT CONTACT BY INDEX
export async function PUT(request: Request) {
  const body = await request.json();
  const { index, updatedData } = body;

  if (index < 0 || index >= DataContact.length) {
    return NextResponse.json({ error: "Index not found" }, { status: 400 });
  }

  DataContact[index] = { ...DataContact[index], ...updatedData };

  return NextResponse.json({
    message: "Contact updated",
    data: DataContact[index],
  });
}