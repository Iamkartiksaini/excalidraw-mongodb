import { create } from "zustand";
import { getUserDrawings } from "@/actions/drawingActions";
import { getUserNotes } from "@/actions/noteActions";
import { getUserFolders } from "@/actions/folderActions";
import { getSharedWithMeNotes } from "@/actions/shareActions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CloudDrawing {
  _id: string;
  title: string;
  elements: any[];
  appState: any;
  userId: string;
  shareId: string;
  isPublic: boolean;
  version: number;
  updatedAt: string;
  createdAt: string;
  [key: string]: any;
}

export interface CloudNote {
  _id: string;
  title: string;
  content: string;
  userId: string;
  visibility: string;
  isPublic: boolean;
  shareId?: string;
  folderId?: string;
  updatedAt: string;
  createdAt: string;
  [key: string]: any;
}

export interface CloudFolder {
  _id: string;
  title: string;
  userId: string;
  visibility: string;
  shareId?: string;
  updatedAt: string;
  createdAt: string;
  [key: string]: any;
}

export interface SharedData {
  notes: CloudNote[];
  folders: CloudFolder[];
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface CloudStore {
  // ── Drawings ──────────────────────────────────────────────────────────────
  drawings: CloudDrawing[] | null;
  drawingsLoading: boolean;
  fetchDrawings: () => Promise<void>;
  clearDrawings: () => void;

  // ── Notes ─────────────────────────────────────────────────────────────────
  notes: CloudNote[] | null;
  notesLoading: boolean;
  fetchNotes: () => Promise<void>;
  clearNotes: () => void;

  // ── Folders ───────────────────────────────────────────────────────────────
  folders: CloudFolder[] | null;
  foldersLoading: boolean;
  fetchFolders: () => Promise<void>;
  clearFolders: () => void;

  // ── Shared with me ────────────────────────────────────────────────────────
  shared: SharedData | null;
  sharedLoading: boolean;
  fetchShared: () => Promise<void>;
  clearShared: () => void;
}

// ---------------------------------------------------------------------------
// Store implementation (session-only — no persist middleware)
// ---------------------------------------------------------------------------

export const useCloudStore = create<CloudStore>((set, get) => ({
  // ── Drawings ──────────────────────────────────────────────────────────────
  drawings: null,
  drawingsLoading: false,

  fetchDrawings: async () => {
    if (get().drawingsLoading) return; // prevent duplicate in-flight requests
    set({ drawingsLoading: true });
    try {
      const data = await getUserDrawings();
      set({ drawings: data, drawingsLoading: false });
    } catch {
      set({ drawingsLoading: false });
    }
  },

  clearDrawings: () => set({ drawings: null }),

  // ── Notes ─────────────────────────────────────────────────────────────────
  notes: null,
  notesLoading: false,

  fetchNotes: async () => {
    if (get().notesLoading) return;
    set({ notesLoading: true });
    try {
      const data = await getUserNotes();
      set({ notes: data, notesLoading: false });
    } catch {
      set({ notesLoading: false });
    }
  },

  clearNotes: () => set({ notes: null }),

  // ── Folders ───────────────────────────────────────────────────────────────
  folders: null,
  foldersLoading: false,

  fetchFolders: async () => {
    if (get().foldersLoading) return;
    set({ foldersLoading: true });
    try {
      const data = await getUserFolders();
      set({ folders: data, foldersLoading: false });
    } catch {
      set({ foldersLoading: false });
    }
  },

  clearFolders: () => set({ folders: null }),

  // ── Shared with me ────────────────────────────────────────────────────────
  shared: null,
  sharedLoading: false,

  fetchShared: async () => {
    if (get().sharedLoading) return;
    set({ sharedLoading: true });
    try {
      const data = await getSharedWithMeNotes();
      set({ shared: data, sharedLoading: false });
    } catch {
      set({ sharedLoading: false });
    }
  },

  clearShared: () => set({ shared: null }),
}));
