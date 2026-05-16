"use server";

import connectToDatabase from "@/lib/db";
import Note from "@/models/Note";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

// --- Types ---

export interface NoteData {
  title: string;
  content: string;
}

// --- Actions ---

export async function createNote(title: string = "Untitled Note") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();

  const note = await Note.create({
    userId,
    title,
    content: "",
    shareId: nanoid(10),
  });

  return JSON.parse(JSON.stringify(note));
}

export async function getUserNotes() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const notes = await Note.find({ userId }).sort({ updatedAt: -1 });

  return JSON.parse(JSON.stringify(notes));
}

export async function getNoteById(id: string) {
  const { userId } = await auth();

  await connectToDatabase();
  const note = await Note.findById(id);

  if (!note) throw new Error("Note not found");
  if (note.userId !== userId && !note.isPublic) throw new Error("Unauthorized");

  return JSON.parse(JSON.stringify(note));
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const note = await Note.findOne({ _id: id, userId });

  if (!note) throw new Error("Note not found or unauthorized");

  if (data.title !== undefined) note.title = data.title;
  if (data.content !== undefined) note.content = data.content;

  await note.save();

  revalidatePath(`/notes/${id}`, "page");
  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(note));
}

export async function deleteNote(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const result = await Note.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) throw new Error("Note not found or unauthorized");

  revalidatePath("/dashboard", "page");
  return { success: true };
}

export async function toggleNotePublic(id: string, isPublic: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    { isPublic },
    { new: true }
  );

  if (!note) throw new Error("Note not found");

  revalidatePath(`/notes/${id}`, "page");
  return JSON.parse(JSON.stringify(note));
}

export async function getPublicNote(shareId: string) {
  await connectToDatabase();
  const note = await Note.findOne({ shareId, isPublic: true });

  if (!note) throw new Error("Public note not found");

  return JSON.parse(JSON.stringify(note));
}

export async function migrateLocalNote(data: NoteData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { title, content } = data;

  await connectToDatabase();
  const note = await Note.create({
    userId,
    title,
    content,
    shareId: nanoid(10),
  });

  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(note));
}
