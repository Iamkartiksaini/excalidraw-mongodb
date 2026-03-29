import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Cloud, Lock, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col" style={{ fontFamily: "'Virgil', 'Comic Sans MS', cursive, sans-serif" }}>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 bg-white">
        {/* Excalidraw-style hand-drawn badge */}
        <div
          className="inline-block mb-8 bg-[#f3f0ff] border-2 border-[#9b96f0] text-[#6965db] text-sm font-bold px-4 py-1.5 rounded-full"
          style={{ fontFamily: "'Virgil', cursive", borderRadius: "40px 8px 36px 12px / 12px 36px 8px 40px" }}
        >
          ✨ Free to use · No sign-up required
        </div>

        <h1
          className="text-5xl sm:text-6xl font-extrabold text-[#1e1e1e] mb-6 leading-tight tracking-tight"
          style={{ fontFamily: "'Virgil', cursive" }}
        >
          A virtual whiteboard<br />
          <span style={{ color: "#6965db", textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: "#9b96f0" }}>
            for your ideas
          </span>
        </h1>

        <p className="text-lg text-[#495057] max-w-xl mb-10 leading-relaxed font-sans">
          Sketch, diagram, and brainstorm with an infinite canvas. Save to cloud and share with anyone — or just draw freely.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/draw"
            className="bg-[#6965db] text-white font-bold px-8 py-3.5 text-base transition-all hover:bg-[#5854c4] flex items-center gap-2 shadow-md"
            style={{ borderRadius: "12px 4px 10px 4px / 4px 10px 4px 12px" }}
          >
            Start drawing — it&apos;s free
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                className="bg-white text-[#6965db] font-bold px-8 py-3.5 text-base border-2 border-[#6965db] transition-all hover:bg-[#f3f0ff] flex items-center gap-2"
                style={{ borderRadius: "4px 12px 4px 10px / 10px 4px 12px 4px" }}
              >
                Sign in to save
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="bg-white text-[#6965db] font-bold px-8 py-3.5 text-base border-2 border-[#6965db] transition-all hover:bg-[#f3f0ff] flex items-center gap-2"
              style={{ borderRadius: "4px 12px 4px 10px / 10px 4px 12px 4px" }}
            >
              My Dashboard
            </Link>
          </Show>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#f8f9fa] border-t-2 border-dashed border-[#e9ecef] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl font-bold text-center text-[#1e1e1e] mb-14"
            style={{ fontFamily: "'Virgil', cursive" }}
          >
            Everything you need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Cloud className="w-6 h-6 text-[#6965db]" />}
              title="Cloud Sync"
              description="Sign in to save your drawings to MongoDB. Pick up where you left off on any device."
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6 text-[#6965db]" />}
              title="Version History"
              description="Every save creates a snapshot. Restore any previous version of your drawing."
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6 text-[#6965db]" />}
              title="Share Instantly"
              description="Generate a public link and share your board with anyone — no login required to view."
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className="bg-white p-6 border-2 border-[#e9ecef] hover:border-[#6965db] transition-colors shadow-sm hover:shadow-md"
      style={{ borderRadius: "8px 2px 6px 2px / 2px 6px 2px 8px" }}
    >
      <div className="w-12 h-12 rounded-xl bg-[#f3f0ff] flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="font-bold text-[#1e1e1e] mb-2 text-xl" style={{ fontFamily: "'Virgil', cursive" }}>{title}</h3>
      <p className="text-sm text-[#868e96] leading-relaxed font-sans">{description}</p>
    </div>
  );
}
