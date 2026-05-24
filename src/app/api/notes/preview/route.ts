import { NextResponse } from "next/server";
import { getUserNotesPreview } from "@/actions/noteActions";

export async function GET() {
  try {
    const notes = await getUserNotesPreview();
    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
