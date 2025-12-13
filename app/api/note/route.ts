import { NextResponse } from "next/server";
import { DataNote } from "@/lib/data/dummy";

export function GET() {
  return NextResponse.json({
    status: "success",
    data: DataNote,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const newId =
    DataNote.length > 0
      ? Math.max(...DataNote.map((n) => n.id)) + 1
      : 1;

  const newNote = {
    id: newId,
    ...body,
  };

  DataNote.unshift(newNote);

  return NextResponse.json({
    message: "Note added",
    data: newNote,
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, updatedData } = body;

  const index = DataNote.findIndex((n) => n.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: "Note not found" },
      { status: 404 }
    );
  }

  DataNote[index] = {
    ...DataNote[index],
    ...updatedData,
  };

  return NextResponse.json({
    message: "Note updated",
    data: DataNote[index],
  });
}
