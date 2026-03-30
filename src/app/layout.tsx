import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import "@excalidraw/excalidraw/index.css";
import { Raleway, Roboto_Slab } from "next/font/google";
import { cn } from "@/lib/utils";

const robotoSlabHeading = Roboto_Slab({ subsets: ['latin'], variable: '--font-heading' });

const raleway = Raleway({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Excali-Draw — Collaborative Whiteboard with MongoDB",
  description: "A premium, hand-drawn style virtual whiteboard with real-time cloud sync powered by MongoDB. Sketch, collaborate, and save your ideas effortlessly.",
  keywords: ["Excalidraw", "MongoDB", "Whiteboard", "Collaboration", "Real-time Sync", "Digital Sketching"],
};

import QueryProvider from "@/components/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", raleway.variable, robotoSlabHeading.variable)}>
      <body className="min-h-screen flex flex-col bg-white text-[#212529]">
        <ClerkProvider>
          <QueryProvider>
          <Navbar />
            <main
              className="flex-1 flex flex-col h-full">
            {children}
          </main>
          <Toaster position="bottom-right" richColors />
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
