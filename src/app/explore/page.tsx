import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore Creators — Excali-Draw",
  description: "Search and discover creators on Excali-Draw. Explore their public hand-drawn whiteboard boards, notes, and collaborative ideas.",
  keywords: ["Explore Creators", "Public Notes", "Excalidraw Search", "Collaborative Whiteboards", "Shared Sketching"],
};

export default function ExplorePage() {
  return <ExploreClient />;
}
