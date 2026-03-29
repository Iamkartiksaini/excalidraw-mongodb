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
  title: "Excalidraw-MongoDB",
  description: "A free virtual whiteboard with cloud sync and sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", raleway.variable, robotoSlabHeading.variable)}>
        <body className="min-h-screen flex flex-col bg-white text-[#212529]">
          <Navbar />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
