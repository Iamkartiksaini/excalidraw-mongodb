"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { PenLine, FileText, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocalDrawingCard from "@/components/LocalDrawingCard";
import CreateLiveButton from "@/components/CreateLiveButton";
import CreateLocalButton from "@/components/CreateLocalButton";
import CreateNoteButton from "@/components/CreateNoteButton";
import NoteCard from "@/components/NoteCard";
import CreateFolderButton from "@/components/CreateFolderButton";
import FolderCard from "@/components/FolderCard";
import { getAllGuestDrawings, getAllGuestNotes, GuestNoteRecord } from "@/lib/guestStorage";
import { getUserDrawings } from "@/actions/drawingActions";
import { getUserNotes } from "@/actions/noteActions";
import { getUserFolders } from "@/actions/folderActions";
import { getSharedWithMeNotes } from "@/actions/shareActions";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import DrawingCardSkeleton from "@/components/DrawingCardSkeleton";

const LiveDrawingCard = lazy(() => import("@/components/LiveDrawingCard"));

export default function DashboardClient() {
  const { isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use local state for instant tab switching to avoid Next.js navigation lag
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "local");

  // Sync state if URL changes externally (e.g., back/forward button)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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

  const {
    data: cloudNotes = [],
    isLoading: isCloudNotesLoading,
    refetch: refetchCloudNotes,
  } = useQuery({
    queryKey: ["notes", "cloud"],
    queryFn: getUserNotes,
    enabled: isSignedIn && activeTab === "notes",
  });

  const {
    data: cloudFolders = [],
    isLoading: isCloudFoldersLoading,
    refetch: refetchCloudFolders,
  } = useQuery({
    queryKey: ["folders", "cloud"],
    queryFn: getUserFolders,
    enabled: isSignedIn && activeTab === "notes",
  });

  const {
    data: localNotes = [],
    isLoading: isLocalNotesLoading,
    refetch: refetchLocalNotes,
  } = useQuery({
    queryKey: ["notes", "local"],
    queryFn: getAllGuestNotes,
  });

  const {
    data: sharedWithMe = { notes: [], folders: [] },
    isLoading: isSharedLoading,
    refetch: refetchShared,
  } = useQuery({
    queryKey: ["notes", "shared"],
    queryFn: getSharedWithMeNotes,
    enabled: isSignedIn && activeTab === "shared",
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    // Update the URL without triggering a Next.js server roundtrip
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto pt-10 px-4 pb-20 w-full flex justify-center">
        <span className="text-sm text-[#868e96]" style={{ fontFamily: "'Virgil', cursive" }}>Loading dashboard...</span>
      </div>
    );
  }

  // If NOT signed in, show tabs with local drawings + notes
  if (!isSignedIn) {
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
          <TabsList className="mb-8 p-1 bg-[#f3f0ff] border-2 border-[#e9ecef] flex h-auto" style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px", fontFamily: "'Virgil', cursive" }}>
            <TabsTrigger
              value="local"
              className="data-[state=active]:bg-white data-[state=active]:text-[#f59f00] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5"
            >
              Local Drawings {localDrawings.length > 0 && `(${localDrawings.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-white data-[state=active]:text-[#6965db] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Notes {localNotes.length > 0 && `(${localNotes.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="mt-0 outline-none">
            {isLocalLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <DrawingCardSkeleton key={i} />)}
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
                    isLoggedIn={false}
                    onUpdate={() => refetchLocal()}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-0 outline-none">
            {isLocalNotesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(2)].map((_, i) => <DrawingCardSkeleton key={i} />)}
              </div>
            ) : localNotes.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <CreateNoteButton asCard />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <CreateNoteButton asCard />
                {localNotes.map((note: GuestNoteRecord) => (
                  <NoteCard
                    key={note.key}
                    note={{ key: note.key, title: note.title, content: note.content, updatedAt: note.updatedAt }}
                    isGuest
                    onDelete={() => refetchLocalNotes()}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
        <TabsList className="mb-8 p-1 bg-[#f3f0ff] border-2 border-[#e9ecef] flex h-auto" style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px", fontFamily: "'Virgil', cursive" }}>
          <TabsTrigger
            value="live"
            className="data-[state=active]:bg-white data-[state=active]:text-[#6965db] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5"
          >
            Cloud Drawings
          </TabsTrigger>
          <TabsTrigger
            value="local"
            className="data-[state=active]:bg-white data-[state=active]:text-[#f59f00] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5"
          >
            Local Drawings {localDrawings.length > 0 && `(${localDrawings.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="data-[state=active]:bg-white data-[state=active]:text-[#6965db] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Notes {(cloudNotes.length + localNotes.length + cloudFolders.length) > 0 && `(${cloudNotes.length + localNotes.length + cloudFolders.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="shared"
            className="data-[state=active]:bg-white data-[state=active]:text-[#6965db] data-[state=active]:shadow-sm text-[#495057] transition-all font-semibold rounded-md flex-1 px-6 py-2 flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Shared {(sharedWithMe.notes.length + sharedWithMe.folders.length) > 0 && `(${sharedWithMe.notes.length + sharedWithMe.folders.length})`}
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
        {/* NOTES TAB CONTENT */}
        <TabsContent value="notes" className="mt-0 outline-none">
          {/* Cloud folders section */}
          {isSignedIn && (
            <>
              <p className="text-xs font-semibold text-[#adb5bd] uppercase tracking-widest mb-4">Cloud Folders</p>
              {isCloudFoldersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => <DrawingCardSkeleton key={i} />)}
                </div>
              ) : cloudFolders.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <CreateFolderButton asCard onCreated={() => refetchCloudFolders()} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <CreateFolderButton asCard onCreated={() => refetchCloudFolders()} />
                  {cloudFolders.map((folder: any) => (
                    <FolderCard
                      key={folder._id}
                      folder={folder}
                      onDelete={() => refetchCloudFolders()}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Cloud notes section */}
          {isSignedIn && (
            <>
              <p className="text-xs font-semibold text-[#adb5bd] uppercase tracking-widest mb-4">Cloud Notes</p>
              {isCloudNotesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => <DrawingCardSkeleton key={i} />)}
                </div>
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
                      onDelete={() => refetchCloudNotes()}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Local notes section */}
          <p className="text-xs font-semibold text-[#adb5bd] uppercase tracking-widest mb-4">Local Notes</p>
          {isLocalNotesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(2)].map((_, i) => <DrawingCardSkeleton key={i} />)}
            </div>
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
                  onMigrate={() => { refetchLocalNotes(); refetchCloudNotes(); }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* SHARED WITH ME TAB CONTENT */}
        <TabsContent value="shared" className="mt-0 outline-none">
          {/* Shared Folders */}
          {sharedWithMe.folders.length > 0 && (
            <>
              <p className="text-xs font-semibold text-[#adb5bd] uppercase tracking-widest mb-4">Shared Folders</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {sharedWithMe.folders.map((folder: any) => (
                  <FolderCard
                    key={folder._id}
                    folder={folder}
                    onDelete={() => refetchShared()}
                  />
                ))}
              </div>
            </>
          )}

          {/* Shared Notes */}
          <p className="text-xs font-semibold text-[#adb5bd] uppercase tracking-widest mb-4">Shared Notes</p>
          {isSharedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <DrawingCardSkeleton key={i} />)}
            </div>
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
                  onDelete={() => refetchShared()}
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
