import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import NoteEditor from "./NoteEditor";
import { getNoteById } from "@/actions/noteActions";

interface NotePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guest?: string; share?: string }>;
}

export async function generateMetadata({ params, searchParams }: NotePageProps): Promise<Metadata> {
  const { id } = await params;
  const { guest } = await searchParams;
  if (guest) return { title: "Local Note — Excali-Draw" };
  try {
    const note = await getNoteById(id);
    return { title: `${note.title} — Excali-Draw` };
  } catch {
    return { title: "Note — Excali-Draw" };
  }
}

export default async function NotePage({ params, searchParams }: NotePageProps) {
  const { id } = await params;
  const { guest, share } = await searchParams;
  const { userId } = await auth();

  // Guest note: NoteEditor will handle loading from IndexedDB on the client
  if (guest === "1" || !userId) {
    const placeholderNote = {
      key: id,
      title: "Untitled Note",
      content: "",
    };
    return <NoteEditor initialNote={placeholderNote} isGuest />;
  }

  // Cloud note
  try {
    const note = await getNoteById(id);
    return <NoteEditor initialNote={note} isGuest={false} autoOpenShare={share === "1"} />;
  } catch {
    notFound();
  }
}
