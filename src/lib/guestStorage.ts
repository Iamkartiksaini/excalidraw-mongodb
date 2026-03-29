/**
 * IndexedDB persistence for guest (unauthenticated) drawings.
 * DB: "excalidraw-guest"  |  Store: "drawings"  |  Key: "current"
 */

const DB_NAME = "excalidraw-guest";
const STORE_NAME = "drawings";
const DB_VERSION = 1;
const RECORD_KEY = "current";

export interface GuestDrawingRecord {
  key: string;
  elements: any[];
  appState: any;
  title: string;
  lastUpdated: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveGuestDrawing(data: {
  elements: any[];
  appState: any;
  title: string;
}): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const record: GuestDrawingRecord = {
      key: RECORD_KEY,
      elements: data.elements,
      appState: data.appState,
      title: data.title,
      lastUpdated: new Date().toISOString(),
    };

    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function loadGuestDrawing(): Promise<GuestDrawingRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const req = store.get(RECORD_KEY);
    req.onsuccess = () => resolve((req.result as GuestDrawingRecord) ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function clearGuestDrawing(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const req = store.delete(RECORD_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}
