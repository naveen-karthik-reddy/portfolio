const DB_NAME = "perf-planner";
const DB_VERSION = 2;

let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      const oldVersion = e.oldVersion;
      if (oldVersion < 1) {
        db.createObjectStore("pages", { keyPath: "id" });
        const store = db.createObjectStore("variations", { keyPath: "id" });
        store.createIndex("pageId", "pageId", { unique: false });
      }
      if (oldVersion < 2) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror   = (e) => reject(e.target.error);
  });
}

function tx(storeName, mode, fn) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const t = db.transaction(storeName, mode);
      const store = t.objectStore(storeName);
      const req = fn(store);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror   = (e) => reject(e.target.error);
    });
  });
}

// ── Pages ──────────────────────────────────────────────────────────

export function getAllPages() {
  return tx("pages", "readonly", (s) => s.getAll());
}

export function savePage(page) {
  return tx("pages", "readwrite", (s) => s.put(page));
}

export function deletePage(id) {
  return deleteVariationsByPageId(id).then(() =>
    tx("pages", "readwrite", (s) => s.delete(id))
  );
}

// ── Variations ────────────────────────────────────────────────────

export function getAllVariations() {
  return tx("variations", "readonly", (s) => s.getAll());
}

export function saveVariation(variation) {
  return tx("variations", "readwrite", (s) => s.put(variation));
}

export function deleteVariation(id) {
  return tx("variations", "readwrite", (s) => s.delete(id));
}

export function getVariationsByPageId(pageId) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const t = db.transaction("variations", "readonly");
      const index = t.objectStore("variations").index("pageId");
      const req = index.getAll(pageId);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror   = (e) => reject(e.target.error);
    });
  });
}

export function deleteVariationsByPageId(pageId) {
  return getVariationsByPageId(pageId).then((vars) =>
    Promise.all(vars.map((v) => deleteVariation(v.id)))
  );
}

// ── Settings ──────────────────────────────────────────────────────

export function getSettings(id) {
  return tx("settings", "readonly", (s) => s.get(id));
}

export function saveSettings(doc) {
  return tx("settings", "readwrite", (s) => s.put(doc));
}
