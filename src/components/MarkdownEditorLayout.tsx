"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Edit3, Eye, GripVertical } from "lucide-react";

interface MarkdownEditorLayoutProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  onTitleBlur?: () => void;
  backButtonSlot?: ReactNode;
  saveIndicatorSlot?: ReactNode;
  actionButtonsSlot?: ReactNode;
}

type MobileTab = "edit" | "preview";

export default function MarkdownEditorLayout({
  title,
  setTitle,
  content,
  setContent,
  onTitleBlur,
  backButtonSlot,
  saveIndicatorSlot,
  actionButtonsSlot,
}: MarkdownEditorLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");
  const [splitPct, setSplitPct] = useState(50); // left pane width %
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPct = useRef(50);

  // --- Resizable drag handle ---
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartPct.current = splitPct;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const delta = e.clientX - dragStartX.current;
      const deltaPct = (delta / containerWidth) * 100;
      const newPct = Math.min(80, Math.max(20, dragStartPct.current + deltaPct));
      setSplitPct(newPct);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--navbar-height,56px))] bg-white">
      {/* ── Toolbar ── */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b-2 border-[#e9ecef] bg-white shrink-0">
        {/* Back */}
        {backButtonSlot}

        <div className="w-px h-5 bg-[#e9ecef]" />

        {/* Title (inline editable) */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={onTitleBlur}
          className="flex-1 font-bold text-[#1e1e1e] text-base bg-transparent outline-none placeholder:text-[#adb5bd] min-w-0"
          style={{ fontFamily: "'Virgil', cursive" }}
          placeholder="Untitled Note"
          maxLength={120}
        />

        {saveIndicatorSlot}

        {/* Mobile tab toggle */}
        <div className="flex md:hidden border-2 border-[#e9ecef] rounded-lg overflow-hidden text-xs font-semibold">
          <button
            onClick={() => setMobileTab("edit")}
            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
              mobileTab === "edit" ? "bg-[#6965db] text-white" : "text-[#495057] hover:bg-[#f3f0ff]"
            }`}
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
              mobileTab === "preview" ? "bg-[#6965db] text-white" : "text-[#495057] hover:bg-[#f3f0ff]"
            }`}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {actionButtonsSlot}
        </div>
      </header>

      {/* ── Editor area ── */}
      {/* Desktop: resizable split pane */}
      <div ref={containerRef} className="hidden md:flex flex-1 overflow-hidden">
        {/* Left pane — editor */}
        <div className="flex flex-col overflow-hidden border-r-0" style={{ width: `${splitPct}%` }}>
          <div className="px-4 py-1.5 border-b border-[#f1f3f5] bg-[#f8f9fa]">
            <span className="text-[10px] font-semibold text-[#adb5bd] uppercase tracking-widest flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Markdown
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"# My Note\n\nStart writing in **Markdown**...\n\n- List item\n- Another item\n\n```code block```"}
            className="flex-1 resize-none outline-none p-5 font-mono text-sm text-[#212529] leading-relaxed bg-white placeholder:text-[#ced4da]"
            spellCheck={false}
          />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="relative flex items-center justify-center w-2 bg-[#f1f3f5] hover:bg-[#d0c8f8] cursor-col-resize group shrink-0 transition-colors"
          title="Drag to resize"
        >
          <GripVertical className="w-3 h-3 text-[#adb5bd] group-hover:text-[#6965db] transition-colors" />
        </div>

        {/* Right pane — preview */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${100 - splitPct}%` }}>
          <div className="px-4 py-1.5 border-b border-[#f1f3f5] bg-[#f8f9fa]">
            <span className="text-[10px] font-semibold text-[#adb5bd] uppercase tracking-widest flex items-center gap-1">
              <Eye className="w-3 h-3" /> Preview
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {content ? (
              <div className="markdown-preview">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-[#ced4da] italic">Preview will appear here…</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: single pane with tab toggle */}
      <div className="flex md:hidden flex-1 overflow-hidden flex-col">
        {mobileTab === "edit" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"# My Note\n\nStart writing in **Markdown**..."}
            className="flex-1 resize-none outline-none p-5 font-mono text-sm text-[#212529] leading-relaxed bg-white placeholder:text-[#ced4da]"
            spellCheck={false}
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            {content ? (
              <div className="markdown-preview">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-[#ced4da] italic">Preview will appear here…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
