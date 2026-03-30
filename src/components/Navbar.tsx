"use client";

import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { Pencil, LayoutGrid, ArrowUpToLine, ArrowDownToLine } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isVisible, setVisible] = useState(true);

  function toggleVisibility() {
    setVisible(!isVisible);
  };

  return (<div className="relative  ">
    <nav id="navbar" className={cn("bg-white sticky  overflow-hidden  max-h-50 flex top-0 z-50 h-14 transition-all duration-300 ease-in-out items-center shadow-sm",
      isVisible ? "translate-y-0" : "-translate-y-full max-h-0"
    )}>
      <div className="w-full max-w-screen-xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-[#1e1e1e] tracking-tight hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Virgil', 'Comic Sans MS', cursive" }}
        >
          <div className="bg-[#e0d6ff] p-1.5 rounded-lg">
            <Pencil className="w-5 h-5 text-[#6965db]" />
          </div>
          Excalidraw-MongoDB
        </Link>

        {/* Nav Links + Auth */}
        <div className="flex items-center gap-4">

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#1e1e1e] hover:bg-[#f3f4f6] transition-colors py-2 px-3 rounded-lg flex items-center gap-2"
              style={{ fontFamily: "'Virgil', cursive" }}
            >
              <LayoutGrid className="w-4 h-4 text-[#6965db]" />
              My Boards
            </Link>
            <div className="pl-2 border-l border-gray-200">
              <UserButton />
            </div>
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                className="text-sm font-medium text-[#1e1e1e] hover:bg-[#f3f4f6] transition-colors py-2 px-4 rounded-lg"
                style={{ fontFamily: "'Virgil', cursive" }}
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                className="text-sm font-medium bg-[#6965db] text-white px-4 py-2 hover:bg-[#5854c4] transition-colors shadow-sm"
                style={{
                  borderRadius: "8px 2px 8px 3px / 3px 8px 3px 8px",
                  fontFamily: "'Virgil', cursive"
                }}
              >
                Sign up
              </button>
            </SignUpButton>
          </Show>
        </div>
      </div>
    </nav>
    <button className={cn("absolute top-1 transition-all left-[50%] duration-300 ease-in-out hover:bg-sky-200  w-15 h-2 bg-neutral-400",
      "rounded-full", "flex items-center justify-center z-50",
      isVisible ? "translate-y-[48px]" : ""
    )}
      onClick={toggleVisibility}>
      {/* {isVisible ? <ArrowUpToLine size={14} /> : <ArrowDownToLine size={14} />} */}
    </button>
  </div>
  );
}
