import { DataNote } from "@/lib/data/dummy";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    success: true,
    data: DataNote,
  });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { title, content, reminder_date, reminder_time } = body;
    
    if (!title || !content || !reminder_date || !reminder_time) {
      return NextResponse.json(
        { error: { message: "Missing required fields: title, content, reminder_date, reminder_time" } },
        { status: 400 }
      );
    }

    const newId =
      DataNote.length > 0
        ? Math.max(...DataNote.map((n) => n.id)) + 1
        : 1;

    const newNote = {
      id: newId,
      title,
      content,
      date: reminder_date,
      time: reminder_time,
    };

    DataNote.unshift(newNote);

    return NextResponse.json({
      success: true,
      message: "Note added successfully",
      data: newNote,
    });
  } catch (error) {
    console.error("POST note error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, content, reminder_date, reminder_time } = body;

    if (!id) {
      return NextResponse.json(
        { error: { message: "Note ID is required" } },
        { status: 400 }
      );
    }

    const index = DataNote.findIndex((n) => n.id.toString() === id.toString());

    if (index === -1) {
      return NextResponse.json(
        { error: { message: "Note not found" } },
        { status: 404 }
      );
    }

    // Update the note with new data
    DataNote[index] = {
      ...DataNote[index],
      ...(title && { title }),
      ...(content && { content }),
      ...(reminder_date && { date: reminder_date }),
      ...(reminder_time && { time: reminder_time }),
    };

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      data: DataNote[index],
    });
  } catch (error) {
    console.error("PUT note error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}