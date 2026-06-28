"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { PenLine, FileText, Users, LogIn } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocalDrawingCard from "@/components/LocalDrawingCard";
import CreateLiveButton from "@/components/CreateLiveButton";
import CreateLocalButton from "@/components/CreateLocalButton";
import CreateNoteButton from "@/components/CreateNoteButton";
import NoteCard from "@/components/NoteCard";
import CreateFolderButton from "@/components/CreateFolderButton";
import FolderCard from "@/components/FolderCard";
import RefreshButton from "@/components/RefreshButton";
import CloudSectionShimmerHeader from "@/components/CloudSectionShimmerHeader";
import { getAllGuestDrawings, getAllGuestNotes, GuestNoteRecord } from "@/lib/guestStorage";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import DrawingCardSkeleton from "@/components/DrawingCardSkeleton";
import { useDashboardAuthGuard } from "@/hooks/useDashboardAuthGuard";
import { useCloudStore } from "@/store/cloudStore";

const LiveDrawingCard = lazy(() => import("@/components/LiveDrawingCard"));

// ---------------------------------------------------------------------------
// Tab value constants
// ---------------------------------------------------------------------------
const TAB_LIVE = "live";
const TAB_LOCAL = "local";
const TAB_NOTES = "notes";
const TAB_SHARED = "shared";

// ---------------------------------------------------------------------------
// DashboardClient
// ---------------------------------------------------------------------------

export default function DashboardClient() {
  const { isLoaded, isSignedIn, showCloudTabs } = useDashboardAuthGuard();
  const searchParams = useSearchParams();

  // Use local state for instant tab switching (avoids Next.js navigation lag)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || TAB_LOCAL);

  // Sync state when URL changes externally (back/forward buttons)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // ── Local data (IndexedDB) — runs immediately, no auth required ────────────
  const {
    data: localDrawings = [],
    isLoading: isLocalLoading,
    refetch: refetchLocal,
  } = useQuery({
    queryKey: ["drawings", "local"],
    queryFn: getAllGuestDrawings,
  });

  const {
    data: localNotes = [],
    isLoading: isLocalNotesLoading,
    refetch: refetchLocalNotes,
  } = useQuery({
    queryKey: ["notes", "local"],
    queryFn: getAllGuestNotes,
  });

  // ── Cloud data — Zustand store ─────────────────────────────────────────────
  const {
    drawings: serverDrawings,
    drawingsLoading: isServerLoading,
    fetchDrawings,
    clearDrawings,
    notes: cloudNotes,
    notesLoading: isCloudNotesLoading,
    fetchNotes,
    clearNotes,
    folders: cloudFolders,
    foldersLoading: isCloudFoldersLoading,
    fetchFolders,
    clearFolders,
    shared: sharedWithMe,
    sharedLoading: isSharedLoading,
    fetchShared,
    clearShared,
  } = useCloudStore();

  // ── Lazy fetch on tab switch ───────────────────────────────────────────────
  useEffect(() => {
    if (!showCloudTabs) return;

    if (activeTab === TAB_LIVE && serverDrawings === null) {
      fetchDrawings();
    }
    if (activeTab === TAB_NOTES && cloudNotes === null) {
      fetchNotes();
    }
    if (activeTab === TAB_NOTES && cloudFolders === null) {
      fetchFolders();
    }
    if (activeTab === TAB_SHARED && sharedWithMe === null) {
      fetchShared();
    }
  }, [activeTab, showCloudTabs]);

  // ── Tab change handler ─────────────────────────────────────────────────────
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    // Update URL without triggering a Next.js server roundtrip
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  // ── Refresh handlers (clear slice → re-fetch) ──────────────────────────────
  const handleRefreshDrawings = async () => {
    clearDrawings();
    await fetchDrawings();
  };

  const handleRefreshNotes = async () => {
    clearNotes();
    await fetchNotes();
  };

  const handleRefreshFolders = async () => {
    clearFolders();
    await fetchFolders();
  };

  const handleRefreshShared = async () => {
    clearShared();
    await fetchShared();
  };

  // ── Derived counts for tab labels ──────────────────────────────────────────
  const cloudNoteCount = (cloudNotes?.length ?? 0) + (cloudFolders?.length ?? 0) + localNotes.length;
  const sharedCount = (sharedWithMe?.notes?.length ?? 0) + (sharedWithMe?.folders?.length ?? 0);

  // ── Disabled state for cloud tabs (before auth resolves) ───────────────────
  const cloudTabDisabled = !isLoaded;
  const cloudTabTitle = cloudTabDisabled ? "Loading…" : undefined;

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
        <TabsList
          className="mb-8 p-1 bg-[#f3f0ff] border-2 border-[#e9ecef] flex h-auto"
          style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px", fontFamily: "'Virgil', cursive" }}
        >
          {/* Cloud Drawings tab — only shown when signed in or loading */}
          {(isSignedIn || !isLoaded) && (
            <TabsTrigger
              value={TAB_LIVE}
              disabled={cloudTabDisabled}
              title={cloudTabTitle}
              className="data-[state=active]:bg-white data-[state=active]:text-[#6965db] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cloud Drawings
            </TabsTrigger>
          )}

          {/* Local Drawings tab — always shown immediately */}
          <TabsTrigger
            value={TAB_LOCAL}
            className="data-[state=active]:bg-white data-[state=active]:text-[#f59f00] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5"
          >
            Local Drawings {localDrawings.length > 0 && `(${localDrawings.length})`}
          </TabsTrigger>

          {/* Notes tab — always shown */}
          <TabsTrigger
            value={TAB_NOTES}
            className="data-[state=active]:bg-white data-[state=active]:text-[#6965db] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Notes {cloudNoteCount > 0 && `(${cloudNoteCount})`}
          </TabsTrigger>

          {/* Shared tab — only shown when signed in or loading */}
          {(isSignedIn || !isLoaded) && (
            <TabsTrigger
              value={TAB_SHARED}
              disabled={cloudTabDisabled}
              title={cloudTabTitle}
              className="data-[state=active]:bg-white data-[state=active]:text-[#6965db] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Users className="w-3.5 h-3.5" />
              Shared {sharedCount > 0 && `(${sharedCount})`}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── CLOUD DRAWINGS TAB ─────────────────────────────────────────── */}
        <TabsContent value={TAB_LIVE} className="mt-0 outline-none">
          {!isLoaded ? (
            // Auth not yet resolved — show cloud skeleton
            <SkeletonGrid count={4} variant="cloud" />
          ) : !isSignedIn ? (
            // Auth resolved, not signed in
            <SignInCta />
          ) : isServerLoading || serverDrawings === null ? (
            <SkeletonGrid count={4} variant="cloud" />
          ) : serverDrawings.length === 0 ? (
            <EmptyState type="live" />
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <RefreshButton onRefresh={handleRefreshDrawings} />
              </div>
              <Suspense fallback={<SkeletonGrid count={4} variant="cloud" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <CreateLiveButton asCard />
                  {serverDrawings.map((drawing: any) => (
                    <LiveDrawingCard key={drawing._id} drawing={drawing} />
                  ))}
                </div>
              </Suspense>
            </>
          )}
        </TabsContent>

        {/* ── LOCAL DRAWINGS TAB ─────────────────────────────────────────── */}
        <TabsContent value={TAB_LOCAL} className="mt-0 outline-none">
          {isLocalLoading ? (
            <SkeletonGrid count={4} />
          ) : localDrawings.length === 0 ? (
            <EmptyState type="local" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CreateLocalButton asCard />
              {localDrawings.map((drawing) => (
                <LocalDrawingCard
                  key={drawing.key}
                  drawing={drawing}
                  isLoggedIn={isSignedIn}
                  onUpdate={() => refetchLocal()}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── NOTES TAB ──────────────────────────────────────────────────── */}
        <TabsContent value={TAB_NOTES} className="mt-0 outline-none">
          {/* Cloud Folders section (signed-in only) */}
          {false && (
            <>
              <div className="flex items-center justify-between mb-4">
                <CloudSectionShimmerHeader
                  label="Cloud Folders"
                  isLoading={isCloudFoldersLoading || cloudFolders === null}
                />
                <RefreshButton onRefresh={handleRefreshFolders} label="Refresh Folders" />
              </div>
              {isCloudFoldersLoading || cloudFolders === null ? (
                <SkeletonGrid count={4} variant="cloud" className="mb-8" />
              ) : cloudFolders?.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <CreateFolderButton
                    asCard
                    onCreated={() => {
                      clearFolders();
                      fetchFolders();
                    }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <CreateFolderButton
                    asCard
                    onCreated={() => {
                      clearFolders();
                      fetchFolders();
                    }}
                  />
                      {cloudFolders?.map((folder: any) => (
                    <FolderCard
                      key={folder._id}
                      folder={folder}
                      onDelete={() => {
                        clearFolders();
                        fetchFolders();
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Cloud Notes section (signed-in only) */}
          {showCloudTabs && (
            <>
              <div className="flex items-center justify-between mb-4">
                <CloudSectionShimmerHeader
                  label="Cloud Notes"
                  isLoading={isCloudNotesLoading || cloudNotes === null}
                />
                <RefreshButton onRefresh={handleRefreshNotes} label="Refresh Notes" />
              </div>
              {isCloudNotesLoading || cloudNotes === null ? (
                <SkeletonGrid count={4} variant="cloud" className="mb-8" />
              ) : cloudNotes.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <CreateNoteButton asCard />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <CreateNoteButton asCard />
                  {cloudNotes.map((note: any) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      isGuest={false}
                      onDelete={() => {
                        clearNotes();
                        fetchNotes();
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Local Notes section — always shown */}
          <p className="text-xs font-semibold text-[#adb5bd] uppercase tracking-widest mb-4">
            Local Notes
          </p>
          {isLocalNotesLoading ? (
            <SkeletonGrid count={2} />
          ) : localNotes.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CreateNoteButton asCard isLocal />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CreateNoteButton asCard isLocal />
              {localNotes.map((note: GuestNoteRecord) => (
                <NoteCard
                  key={note.key}
                  note={{ key: note.key, title: note.title, content: note.content, updatedAt: note.updatedAt }}
                  isGuest
                  onDelete={() => refetchLocalNotes()}
                  onMigrate={() => {
                    refetchLocalNotes();
                    clearNotes();
                    fetchNotes();
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── SHARED WITH ME TAB ─────────────────────────────────────────── */}
        <TabsContent value={TAB_SHARED} className="mt-0 outline-none">
          {!isLoaded ? (
            <SkeletonGrid count={4} variant="cloud" />
          ) : !isSignedIn ? (
            <SignInCta />
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <RefreshButton onRefresh={handleRefreshShared} />
              </div>

              {/* Shared Folders */}
              {(sharedWithMe?.folders?.length ?? 0) > 0 && (
                <>
                  <CloudSectionShimmerHeader label="Shared Folders" isLoading={false} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {sharedWithMe!.folders.map((folder: any) => (
                      <FolderCard
                        key={folder._id}
                        folder={folder}
                        onDelete={() => {
                          clearShared();
                          fetchShared();
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Shared Notes */}
              <CloudSectionShimmerHeader
                label="Shared Notes"
                isLoading={isSharedLoading || sharedWithMe === null}
              />
              {isSharedLoading || sharedWithMe === null ? (
                <SkeletonGrid count={4} variant="cloud" />
              ) : sharedWithMe.notes.length === 0 && sharedWithMe.folders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#e9ecef] bg-[#f8f9fa] rounded-2xl gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#f3f0ff] flex items-center justify-center text-[#6965db]">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e1e1e] text-sm mb-1">Nothing shared with you yet</h4>
                    <p className="text-xs text-[#868e96] max-w-[280px] leading-relaxed">
                      When other users share their restricted notes or folders with your email, they will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sharedWithMe.notes.map((note: any) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      isGuest={false}
                      onDelete={() => {
                        clearShared();
                        fetchShared();
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function SkeletonGrid({
  count,
  className,
  variant = "default",
}: {
  count: number;
  className?: string;
  variant?: "default" | "cloud";
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className ?? ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <DrawingCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

function EmptyState({ type }: { type: "local" | "live" }) {
  const isLocal = type === "local";
  const iconColor = isLocal ? "text-[#f59f00]" : "text-[#6965db]";
  const bgColor = isLocal ? "bg-[#fff9db]" : "bg-[#e0d6ff]";

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] items-center justify-center py-24 border-2 border-dashed border-[#e9ecef] bg-[#f8f9fa] shadow-sm flex-col w-full"
      style={{ borderRadius: "12px 4px 10px 4px / 4px 10px 4px 12px", display: "flex" }}
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
      <p className="text-sm text-[#868e96] mb-8 font-medium">Create your first board to get started</p>
      {isLocal ? <CreateLocalButton /> : <CreateLiveButton />}
    </div>
  );
}

function SignInCta() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#e9ecef] bg-[#f8f9fa] rounded-2xl gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-[#f3f0ff] flex items-center justify-center text-[#6965db]">
        <LogIn className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-[#1e1e1e] text-sm mb-1">Sign in to access cloud content</h4>
        <p className="text-xs text-[#868e96] max-w-[280px] leading-relaxed">
          Cloud drawings and shared notes are only available when you're signed in.
        </p>
      </div>
    </div>
  );
}
