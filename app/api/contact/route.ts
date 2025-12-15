import { NextResponse } from "next/server";
import { DataContact } from "@/lib/data/dummy";
import axiosExternal from "@/lib/utils/axiosExternal";

export async function GET(req: Request) {
  try {

   const url = new URL(req.url);

    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";

    const params = {
      page,
      limit,
    };

    const res = await axiosExternal.get("/contacts", { params });
    console.log(res);
    

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