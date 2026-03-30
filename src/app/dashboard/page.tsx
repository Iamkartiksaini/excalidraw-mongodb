import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto pt-10 px-4 pb-20 w-full flex justify-center">
        <span className="text-sm text-[#868e96]" style={{ fontFamily: "'Virgil', cursive" }}>Loading dashboard...</span>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}
