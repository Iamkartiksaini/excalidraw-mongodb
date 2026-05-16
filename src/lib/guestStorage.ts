/**
 * IndexedDB persistence for guest (unauthenticated) drawings and notes.
 * DB: "excalidraw-guest"
 * Stores: "drawings" (v1) | "notes" (v2)
 */

const DB_NAME = "excalidraw-guest";
const STORE_NAME = "drawings";
const NOTES_STORE = "notes";
const DB_VERSION = 2;

export interface GuestDrawingRecord {
  key: string; // The ID of the drawing
  elements: any[];
  appState: any;
  title: string;
  updatedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveGuestDrawing(data: {
  id: string;
  elements: any[];
  appState: any;
  title: string;
}): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const record: GuestDrawingRecord = {
      key: data.id,
      elements: data.elements,
      appState: data.appState,
      title: data.title,
      updatedAt: new Date().toISOString(),
    };

    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function loadGuestDrawing(id: string): Promise<GuestDrawingRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as GuestDrawingRecord) ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteGuestDrawing(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getAllGuestDrawings(): Promise<GuestDrawingRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      // Sort by updatedAt descending
      const results = (req.result as GuestDrawingRecord[]).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      resolve(results);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function renameGuestDrawing(id: string, newTitle: string): Promise<void> {
  const record = await loadGuestDrawing(id);
  if (!record) throw new Error("Drawing not found");
  
  await saveGuestDrawing({
    id,
    elements: record.elements,
    appState: record.appState,
    title: newTitle,
  });
}

// ─── Guest Notes (IndexedDB: notes store) ──────────────────────────────────

export interface GuestNoteRecord {
  key: string;
  title: string;
  content: string;
  updatedAt: string;
}

export async function saveGuestNote(data: {
  id: string;
  title: string;
  content: string;
}): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTES_STORE, "readwrite");
    const store = tx.objectStore(NOTES_STORE);
    const record: GuestNoteRecord = {
      key: data.id,
      title: data.title,
      content: data.content,
      updatedAt: new Date().toISOString(),
    };
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function loadGuestNote(id: string): Promise<GuestNoteRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTES_STORE, "readonly");
    const store = tx.objectStore(NOTES_STORE);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as GuestNoteRecord) ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getAllGuestNotes(): Promise<GuestNoteRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTES_STORE, "readonly");
    const store = tx.objectStore(NOTES_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const results = (req.result as GuestNoteRecord[]).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      resolve(results);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteGuestNote(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTES_STORE, "readwrite");
    const store = tx.objectStore(NOTES_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function renameGuestNote(id: string, newTitle: string): Promise<void> {
  const record = await loadGuestNote(id);
  if (!record) throw new Error("Note not found");
  await saveGuestNote({ id, title: newTitle, content: record.content });
}
