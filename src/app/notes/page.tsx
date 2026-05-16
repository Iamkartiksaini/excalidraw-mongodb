import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Notes — Excali-Draw",
  description: "Create and manage your markdown notes",
};

export default async function NotesPage() {
  const { userId } = await auth();

  if (userId) {
    // Signed-in users go straight to the notes tab on the dashboard
    redirect("/dashboard?tab=notes");
  }

  // Guests also go to the dashboard notes section
  redirect("/dashboard?tab=notes");
}
