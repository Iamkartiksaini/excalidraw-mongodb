"use client";

import { Suspense, lazy, useEffect } from "react";
import { PenLine } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocalDrawingCard from "@/components/LocalDrawingCard";
import CreateLiveButton from "@/components/CreateLiveButton";
import CreateLocalButton from "@/components/CreateLocalButton";
import { getAllGuestDrawings } from "@/lib/guestStorage";
import { getUserDrawings } from "@/actions/drawingActions";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import DrawingCardSkeleton from "@/components/DrawingCardSkeleton";

const LiveDrawingCard = lazy(() => import("@/components/LiveDrawingCard"));

export default function DashboardClient() {
  const { isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "local";

  const {
    data: localDrawings = [],
    isLoading: isLocalLoading,
    refetch: refetchLocal
  } = useQuery({
    queryKey: ["drawings", "local"],
    queryFn: getAllGuestDrawings,
  });

  const {
    data: serverDrawings = [],
    isLoading: isServerLoading,
  } = useQuery({
    queryKey: ["drawings", "live"],
    queryFn: getUserDrawings,
    enabled: isSignedIn && activeTab === "live",
  });

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto pt-10 px-4 pb-20 w-full flex justify-center">
        <span className="text-sm text-[#868e96]" style={{ fontFamily: "'Virgil', cursive" }}>Loading dashboard...</span>
      </div>
    );
  }

  // If NOT signed in, directly show the local drawings grid without tabs
  if (!isSignedIn) {
    return (
      <div className="max-w-7xl mx-auto pt-10 px-4 pb-20 w-full">
        <div className="flex items-center justify-between mb-10">
          <h1
            className="text-3xl font-bold text-[#1e1e1e] tracking-tight"
            style={{ fontFamily: "'Virgil', cursive" }}
          >
            My Local Drawings
          </h1>
        </div>

        {isLocalLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <DrawingCardSkeleton key={i} />
            ))}
          </div>
        ) : localDrawings.length === 0 ? (
          <EmptyState type="local" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {localDrawings.map((drawing) => (
              <LocalDrawingCard
                key={drawing.key}
                drawing={drawing}
                isLoggedIn={false}
                onUpdate={() => refetchLocal()}
              />
            ))}
            <CreateLocalButton asCard />
          </div>
        )}
      </div>
    );
  }

  // If signed in, show Tabs
  return (
    <div className="max-w-7xl mx-auto pt-10 px-4 pb-20 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-3xl font-bold text-[#1e1e1e] tracking-tight"
          style={{ fontFamily: "'Virgil', cursive" }}
        >
          My Dashboard
        </h1>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mb-8 p-1 bg-[#f3f0ff] border-2 border-[#e9ecef]" style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px", fontFamily: "'Virgil', cursive" }}>
          <TabsTrigger
            value="live"
            className="data-[state=active]:bg-white data-[state=active]:text-[#6965db] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-8"
          >
            Cloud Drawings
          </TabsTrigger>
          <TabsTrigger
            value="local"
            className="data-[state=active]:bg-white data-[state=active]:text-[#f59f00] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-8"
          >
            Local Drawings {localDrawings.length > 0 && `(${localDrawings.length})`}
          </TabsTrigger>
        </TabsList>

        {/* LIVE TAB CONTENT */}
        <TabsContent value="live" className="mt-0 outline-none">
          {isServerLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <DrawingCardSkeleton key={i} />
              ))}
            </div>
          ) : serverDrawings.length === 0 ? (
            <EmptyState type="live" />
          ) : (
            <Suspense fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <DrawingCardSkeleton key={i} />
                ))}
              </div>
            }>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <CreateLiveButton asCard />
                {serverDrawings.map((drawing: any) => (
                  <LiveDrawingCard key={drawing._id} drawing={drawing} />
                ))}
              </div>
            </Suspense>
          )}
        </TabsContent>

        {/* LOCAL TAB CONTENT */}
        <TabsContent value="local" className="mt-0 outline-none">
          {isLocalLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <DrawingCardSkeleton key={i} />
              ))}
            </div>
          ) : localDrawings.length === 0 ? (
            <EmptyState type="local" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CreateLocalButton asCard />
              {localDrawings.map((drawing) => (
                <LocalDrawingCard
                  key={drawing.key}
                  drawing={drawing}
                  isLoggedIn={true}
                  onUpdate={() => refetchLocal()}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for empty states
function EmptyState({ type }: { type: "local" | "live" }) {
  const isLocal = type === "local";
  const iconColor = isLocal ? "text-[#f59f00]" : "text-[#6965db]";
  const bgColor = isLocal ? "bg-[#fff9db]" : "bg-[#e0d6ff]";

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] items-center justify-center py-24 border-2 border-dashed border-[#e9ecef] bg-[#f8f9fa] shadow-sm flex-col w-full"
      style={{ borderRadius: "12px 4px 10px 4px / 4px 10px 4px 12px", display: "flex" }} // flex fallback to center items correctly
    >
      <div className={`${bgColor} p-4 rounded-full mb-4`}>
        <PenLine className={`w-10 h-10 ${iconColor}`} />
      </div>
      <p
        className="text-xl font-semibold text-[#1e1e1e] mb-2"
        style={{ fontFamily: "'Virgil', cursive" }}
      >
        No drawings yet
      </p>
      <p className="text-sm text-[#868e96] mb-8 font-medium">
        Create your first board to get started
      </p>
      {isLocal ? <CreateLocalButton /> : <CreateLiveButton />}
    </div>
  );
}
