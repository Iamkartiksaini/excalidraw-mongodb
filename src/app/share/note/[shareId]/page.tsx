import { notFound } from "next/navigation";
import { getPublicNote } from "@/actions/noteActions";
import ReactMarkdown from "react-markdown";
import { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

interface ShareNotePageProps {
  params: Promise<{ shareId: string }>;
}

export async function generateMetadata({ params }: ShareNotePageProps): Promise<Metadata> {
  const { shareId } = await params;
  try {
    const note = await getPublicNote(shareId);
    return {
      title: `${note.title} — Excali-Draw`,
      description: note.content.slice(0, 160).replace(/[#*`_\[\]]/g, ""),
    };
  } catch {
    return { title: "Note — Excali-Draw" };
  }
}

export default async function ShareNotePage({ params }: ShareNotePageProps) {
  const { shareId } = await params;

  let note;
  try {
    note = await getPublicNote(shareId);
  } catch {
    notFound();
  }

  const formattedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#e9ecef] px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#868e96] hover:text-[#6965db] transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Excali-Draw
        </Link>
        <div className="w-px h-5 bg-[#e9ecef]" />
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#6965db] shrink-0" />
          <h1
            className="font-bold text-[#1e1e1e] text-sm truncate"
            style={{ fontFamily: "'Virgil', cursive" }}
          >
            {note.title}
          </h1>
        </div>
        <span className="ml-auto text-[11px] text-[#adb5bd] shrink-0">
          Last updated {formattedDate}
        </span>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white border-2 border-[#e9ecef] rounded-xl p-8 shadow-sm">
          <div className="markdown-preview">
            {note.content ? (
              <ReactMarkdown>{note.content}</ReactMarkdown>
            ) : (
              <p className="text-[#adb5bd] italic">This note is empty.</p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#adb5bd] mt-6">
          Shared via{" "}
          <Link href="/" className="text-[#6965db] hover:underline font-semibold">
            Excali-Draw
          </Link>
        </p>
      </main>
    </div>
  );
}
