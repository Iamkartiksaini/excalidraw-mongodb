"use client";

import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { LayoutGrid, Compass, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Navbar() {
  const [isVisible, setVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hasBarStatus = sessionStorage.getItem("navbar")
    if (hasBarStatus) {
      setVisible(JSON.parse(hasBarStatus));
      document.body.style.setProperty("--navbar-height", hasBarStatus === "true" ? "56px" : "0px");
    }
  }, [])


  function toggleVisibility() {
    if (isVisible) {
      setTimeout(() => {
        document.body.style.setProperty("--navbar-height", "0px");
        sessionStorage.setItem("navbar", "false");
      }, 600)
    } else {
      document.body.style.setProperty("--navbar-height", "56px");
      sessionStorage.setItem("navbar", "true");
    }
    setVisible(!isVisible);
  };

  return (<div style={{ height: "var(--navbar-height,56px)"}} className="relative">
    <nav id="navbar" className={cn("bg-white sticky flex flex-col top-0 z-50 transition-all duration-300 ease-in-out shadow-sm w-full",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="w-full h-14 max-w-7xl mx-auto px-4 flex items-center justify-between relative z-50 bg-white">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-[#1e1e1e] tracking-tight hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Virgil', 'Comic Sans MS', cursive" }}
        >
          <Image height={44} width={44}
            alt="logo"
            className=""
            src={"/favicon.png"} />
          <span className="relative hidden md:block">
            Excalidraw-MongoDB
          </span>
        </Link>

        {/* Desktop Nav Links + Auth */}
        <div className="hidden md:flex items-center gap-4">
          <a target="_blank" href="https://github.com/Iamkartiksaini/excalidraw-mongodb"
            style={{ fontFamily: "'Virgil', cursive" }}
            className="border border-gray-200 rounded-lg py-2 px-3 h-9 hover:bg-[#d5d5f2] flex items-center gap-2"
          >
            <Image height={24} width={24}
              style={{ filter: "invert(1)" }}
              alt="github" src={"/icons/icons8-github.svg"}
            />
            <span>Star Repo</span>
          </a>
          <Link
            href="/explore"
            className="text-sm font-medium text-[#1e1e1e] hover:bg-[#f3f4f6] transition-colors py-2 px-3 rounded-lg flex items-center gap-2"
            style={{ fontFamily: "'Virgil', cursive" }}
          >
            <Compass className="w-4 h-4 text-[#6965db]" />
            Explore
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#1e1e1e] hover:bg-[#f3f4f6] transition-colors py-2 px-3 rounded-lg flex items-center gap-2"
            style={{ fontFamily: "'Virgil', cursive" }}
          >
            <LayoutGrid className="w-4 h-4 text-[#6965db]" />
            My Boards
          </Link>
          <Show when="signed-in">
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

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-4">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-[#1e1e1e] hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={cn(
        "md:hidden absolute left-0 right-0 top-14 bg-white shadow-md flex-col overflow-hidden transition-all duration-300 ease-in-out z-40 border-b border-gray-100",
        isMobileMenuOpen ? "max-h-[400px] opacity-100 border-t" : "max-h-0 opacity-0 border-transparent"
      )}>
        <div className="flex flex-col gap-2 p-4">
          <a target="_blank" href="https://github.com/Iamkartiksaini/excalidraw-mongodb"
            style={{ fontFamily: "'Virgil', cursive" }}
            className="border border-gray-200 rounded-lg py-2 px-3 hover:bg-[#d5d5f2] flex items-center gap-2"
          >
            <Image height={24} width={24} style={{ filter: "invert(1)" }} alt="github" src={"/icons/icons8-github.svg"} />
            <span>Star Repo</span>
          </a>
          <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[#1e1e1e] hover:bg-[#f3f4f6] transition-colors py-2 px-3 rounded-lg flex items-center gap-2" style={{ fontFamily: "'Virgil', cursive" }}>
            <Compass className="w-4 h-4 text-[#6965db]" />
            Explore
          </Link>
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[#1e1e1e] hover:bg-[#f3f4f6] transition-colors py-2 px-3 rounded-lg flex items-center gap-2" style={{ fontFamily: "'Virgil', cursive" }}>
            <LayoutGrid className="w-4 h-4 text-[#6965db]" />
            My Boards
          </Link>
          <Show when="signed-out">
            <div className="h-px bg-gray-200 my-2" />
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-[#1e1e1e] hover:bg-[#f3f4f6] transition-colors py-2 px-4 rounded-lg w-full text-left" style={{ fontFamily: "'Virgil', cursive" }}>
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm font-medium bg-[#6965db] text-white px-4 py-2 hover:bg-[#5854c4] transition-colors shadow-sm w-full text-center mt-2" style={{ borderRadius: "8px 2px 8px 3px / 3px 8px 3px 8px", fontFamily: "'Virgil', cursive" }}>
                Sign up
              </button>
            </SignUpButton>
          </Show>
        </div>
      </div>
    </nav>
    <button className={cn("absolute cursor-pointer top-1 transition-all left-[50%] duration-300 ease-in-out hover:bg-sky-200  w-15 h-2 bg-neutral-400",
      "rounded-full", "flex items-center justify-center z-50",
      isVisible ? "translate-y-[48px]" : ""
    )}
      onClick={toggleVisibility}>
      {/* {isVisible ? <ArrowUpToLine size={14} /> : <ArrowDownToLine size={14} />} */}
    </button>
  </div>
  );
}
