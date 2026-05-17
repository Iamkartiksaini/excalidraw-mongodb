"use server";

import connectToDatabase from "@/lib/db";
import Note from "@/models/Note";
import { auth, currentUser } from "@clerk/nextjs/server";
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
    visibility: "private",
    invitedEmails: [],
    isPublic: false,
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
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const note = await Note.findById(id);

  if (!note) throw new Error("Note not found");

  // Strictly enforce that only the creator/owner can access the editor route's data
  if (note.userId !== userId) {
    throw new Error("Unauthorized");
  }

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
    { isPublic, visibility: isPublic ? "public" : "private" },
    { new: true }
  );

  if (!note) throw new Error("Note not found");

  revalidatePath(`/notes/${id}`, "page");
  return JSON.parse(JSON.stringify(note));
}

export async function getPublicNote(shareId: string) {
  await connectToDatabase();
  const note = await Note.findOne({ shareId });

  if (!note) throw new Error("Note not found: it either does not exist, was deleted, or its visibility has changed.");

  const { userId } = await auth();

  // Owner always has access
  if (userId && note.userId === userId) {
    return JSON.parse(JSON.stringify(note));
  }

  // If note belongs to a folder, enforce folder's access rules strictly overriding note settings
  if (note.folderId) {
    const NoteFolder = (await import("@/models/NoteFolder")).default;
    const folder = await NoteFolder.findById(note.folderId);
    if (!folder) throw new Error("Folder not found");

    if (userId && folder.userId === userId) {
      return JSON.parse(JSON.stringify(note));
    }

    if (folder.visibility === "private") {
      throw new Error("Unauthorized");
    }

    if (folder.visibility === "restricted") {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress;
      if (!email || !folder.invitedEmails.includes(email)) {
        throw new Error("Unauthorized");
      }
      if (userId && note.userId !== userId) {
        await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
      }
      return JSON.parse(JSON.stringify(note));
    }

    if (folder.visibility === "public") {
      if (userId && note.userId !== userId) {
        await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
      }
      return JSON.parse(JSON.stringify(note));
    }

    throw new Error("Unauthorized");
  }

  // No folder, fallback to note-level visibility
  if (note.visibility === "private" || (!note.visibility && !note.isPublic)) {
    throw new Error("Unauthorized");
  }

  if (note.visibility === "restricted") {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email || !note.invitedEmails.includes(email)) {
      throw new Error("Unauthorized");
    }
    if (userId && note.userId !== userId) {
      await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
    }
    return JSON.parse(JSON.stringify(note));
  }

  if (note.visibility === "public" || note.isPublic) {
    if (userId && note.userId !== userId) {
      await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
    }
    return JSON.parse(JSON.stringify(note));
  }

  throw new Error("Unauthorized");
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
    visibility: "private",
    invitedEmails: [],
    isPublic: false,
    shareId: nanoid(10),
  });

  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(note));
}

export async function cloneNote(noteId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const sourceNote = await Note.findOne({ _id: noteId, userId });
  if (!sourceNote) throw new Error("Note not found or unauthorized");

  const newNote = await Note.create({
    userId,
    title: `${sourceNote.title || "Untitled"} (Copy)`,
    content: sourceNote.content,
    visibility: "private",
    invitedEmails: [],
    isPublic: false,
    shareId: nanoid(10),
    // folderId is omitted, detaching it from the folder
  });

  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(newNote));
}

