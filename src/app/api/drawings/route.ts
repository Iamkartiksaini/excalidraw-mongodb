import { NextResponse } from "next/server";
import { getUserDrawings, createDrawing } from "@/actions/drawingActions";

export async function GET() {
  try {
    const drawings = await getUserDrawings();
    return NextResponse.json(drawings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    const drawing = await createDrawing(title);
    return NextResponse.json(drawing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
