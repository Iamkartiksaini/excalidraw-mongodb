"use client";

import BackToDashboard from "@/components/BackToDashboard";
import { Pencil } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] bg-[#f8f9fa] px-4 text-center">
      <div className="relative mb-8">
        <div
          className="w-24 h-24 bg-[#fff9db] border-4 border-[#1e1e1e] flex items-center justify-center p-4 transform rotate-3"
          style={{ borderRadius: "12px 4px 10px 4px / 4px 10px 4px 12px" }}
        >
          <Pencil className="w-12 h-12 text-[#f59f00]" />
        </div>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#fa5252] border-2 border-[#1e1e1e] rounded-full flex items-center justify-center text-white font-bold animate-pulse">
          !
        </div>
      </div>

      <h1
        className="text-6xl font-bold text-[#1e1e1e] mb-4"
        style={{ fontFamily: "'Virgil', cursive" }}
      >
        404
      </h1>

      <p
        className="text-2xl text-[#495057] mb-12 max-w-md mx-auto"
        style={{ fontFamily: "'Virgil', cursive" }}
      >
        Oops! This board seems to have vanished into thin air...
      </p>

      <BackToDashboard />

      <div className="mt-16 flex items-center gap-4 text-[#868e96] opacity-50">
        <div className="h-px w-12 bg-[#dee2e6]" />
        <span style={{ fontFamily: "'Virgil', cursive" }}>Better luck in the dashboard</span>
        <div className="h-px w-12 bg-[#dee2e6]" />
      </div>
    </div>
  );
}
