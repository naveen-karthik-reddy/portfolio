Browsers offer four storage APIs, each with different capacity, persistence, and access patterns. This article compares all four and implements utilities for each: a TTL wrapper for `localStorage`, a cookie helper, and a basic IndexedDB CRUD store.

---

## 1. The Four Storage APIs Compared

```js-exec
console.log("│ API            │ Capacity   │ Persistence  │ Scope       │ Access    │");
console.log("│────────────────│────────────│──────────────│─────────────│───────────│");
console.log("│ Cookies        │ ~4 KB      │ Configurable  │ Domain      │ Sync      │");
console.log("│ localStorage   │ ~5-10 MB   │ Permanent     │ Domain      │ Sync      │");
console.log("│ sessionStorage │ ~5 MB      │ Tab session   │ Tab         │ Sync      │");
console.log("│ IndexedDB      │ >250 MB    │ Permanent     │ Domain      │ Async     │");
console.log("│ Cache API      │ Varies     │ Permanent     │ Domain      │ Async     │");

// Cookies: sent with EVERY HTTP request — keep them small
// localStorage: simple key-value, never expires on its own
// sessionStorage: cleared when the tab closes
// IndexedDB: full database in the browser — async, transactional, indexes
```

---

## 2. `localStorage` Wrapper with TTL Expiry

Plain `localStorage` values never expire. Add TTL support:

```js-exec
const storage = {
  set(key, value, ttlMs = null) {
    const entry = {
      value,
      expires: ttlMs ? Date.now() + ttlMs : null,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  },

  get(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry = JSON.parse(raw);

    // Check expiry
    if (entry.expires && Date.now() > entry.expires) {
      localStorage.removeItem(key); // Clean up expired entry
      return null;
    }

    return entry.value;
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },

  // Get all keys with their values (non-expired)
  getAll() {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = this.get(key);
      if (value !== null) result[key] = value;
    }
    return result;
  },
};

// Test
storage.set("user", { name: "Naveen" }, 5000); // Expires in 5s
console.log("Get (not expired):", storage.get("user")); // { name: "Naveen" }

// After 5 seconds:
setTimeout(() => {
  console.log("Get (expired):", storage.get("user")); // null
  console.log("(Entry auto-cleaned from localStorage)");
}, 5100);
```

---

## 3. Cookie Utilities — get, set, delete

```js-exec
const cookies = {
  set(name, value, { maxAge, path = "/", sameSite = "Lax", secure = true } = {}) {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    if (maxAge) cookie += `; max-age=${maxAge}`;
    cookie += `; path=${path}`;
    cookie += `; SameSite=${sameSite}`;
    if (secure) cookie += "; Secure";
    document.cookie = cookie;
  },

  get(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [key, ...rest] = cookie.split("=");
      if (decodeURIComponent(key) === name) {
        return decodeURIComponent(rest.join("="));
      }
    }
    return null;
  },

  remove(name, { path = "/" } = {}) {
    // Set with past expiry to delete
    document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=${path}`;
  },

  getAll() {
    const result = {};
    for (const cookie of document.cookie.split("; ")) {
      if (!cookie) continue;
      const [key, ...rest] = cookie.split("=");
      result[decodeURIComponent(key)] = decodeURIComponent(rest.join("="));
    }
    return result;
  },
};

// Test (works in browser — simulated here):
cookies.set("theme", "dark", { maxAge: 86400 * 30 }); // 30 days
console.log("Cookie set:", cookies.get("theme")); // "dark"
cookies.remove("theme");
console.log("After remove:", cookies.get("theme")); // null
```

---

## 4. IndexedDB — Basic CRUD Store

IndexedDB is callback-based but can be promisified:

```js-exec
function openDB(name, version, upgradeCallback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      upgradeCallback(db);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function createStore() {
  const db = await openDB("MyApp", 1, (db) => {
    // Create object store (like a table)
    if (!db.objectStoreNames.contains("users")) {
      const store = db.createObjectStore("users", {
        keyPath: "id", // Primary key
        autoIncrement: true,
      });
      // Create indexes for fast querying
      store.createIndex("email", "email", { unique: true });
      store.createIndex("name", "name", { unique: false });
    }
  });

  // CRUD operations:
  const users = {
    async add(user) {
      const tx = db.transaction("users", "readwrite");
      const store = tx.objectStore("users");
      const request = store.add(user);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    async get(id) {
      const tx = db.transaction("users", "readonly");
      const request = tx.objectStore("users").get(id);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
    },

    async getAll() {
      const tx = db.transaction("users", "readonly");
      const request = tx.objectStore("users").getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
    },

    async getByEmail(email) {
      const tx = db.transaction("users", "readonly");
      const index = tx.objectStore("users").index("email");
      const request = index.get(email);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
    },

    async update(user) {
      const tx = db.transaction("users", "readwrite");
      const request = tx.objectStore("users").put(user);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    async delete(id) {
      const tx = db.transaction("users", "readwrite");
      const request = tx.objectStore("users").delete(id);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve();
      });
    },
  };

  return users;
}

// Usage:
createStore().then(async (users) => {
  const id = await users.add({ name: "Naveen", email: "naveen@example.com" });
  console.log("Added user with id:", id);

  const user = await users.get(id);
  console.log("Retrieved:", user);

  const byEmail = await users.getByEmail("naveen@example.com");
  console.log("Found by email:", byEmail);
}).catch((err) => {
  console.log("IndexedDB not available in this environment:", err?.message ?? "No IndexedDB");
});
```

---

## 5. When to Use Which Storage

```js-exec
console.log("Use Cookies for:");
console.log("  - Session tokens (HttpOnly, sent with every request)");
console.log("  - Small preferences that need server access");
console.log("");
console.log("Use localStorage for:");
console.log("  - User preferences (theme, language)");
console.log("  - Cached app state (persists across tabs)");
console.log("  - Small, non-sensitive data (<5MB)");
console.log("");
console.log("Use sessionStorage for:");
console.log("  - Form data during multi-step flow");
console.log("  - Temporary state for current tab only");
console.log("");
console.log("Use IndexedDB for:");
console.log("  - Large datasets (>5MB)");
console.log("  - Offline data for PWAs");
console.log("  - Structured data with query/index needs");
console.log("  - Binary data (blobs, files)");
```

---

## Key Takeaways

- **Cookies** (~4KB): auto-sent with HTTP requests. Use HttpOnly + Secure for auth tokens.
- **localStorage** (~5-10MB): simple sync key-value. Use TTL wrappers for expiration.
- **sessionStorage** (~5MB): same API as localStorage but cleared on tab close.
- **IndexedDB** (>250MB): async, transactional, indexed — a real database in the browser.
- Never store sensitive data in localStorage/sessionStorage (XSS vulnerable). Use HttpOnly cookies for auth tokens.
- IndexedDB operations are **transactional** — all reads/writes happen within a transaction.

---

That concludes the **JavaScript Deep Dive** series — 58 articles from variables and scope through the event loop, async patterns, engine internals, data structures, and browser APIs.
