An Event Emitter (or Pub-Sub) is one of the most practical design patterns in JavaScript — it powers Node.js's `EventEmitter`, browser events, and virtually every state management library. This article implements `on`, `off`, `emit`, and `once` from scratch.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. Basic Event Emitter — `on`, `emit`

```js-exec
class EventEmitter {
  constructor() {
    this._events = {}; // eventName → array of callbacks
  }

  on(eventName, callback) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(callback);
    return this; // Enable chaining
  }

  emit(eventName, ...args) {
    const callbacks = this._events[eventName];
    if (!callbacks) return false;

    for (const cb of callbacks) {
      cb.apply(this, args);
    }
    return true;
  }

  off(eventName, callback) {
    const callbacks = this._events[eventName];
    if (!callbacks) return this;

    this._events[eventName] = callbacks.filter((cb) => cb !== callback);
    return this;
  }
}

// Test
const ee = new EventEmitter();

ee.on("login", (user) => console.log("User logged in:", user));
ee.on("login", (user) => console.log("Analytics: login by", user));

ee.emit("login", "Naveen");
// "User logged in: Naveen"
// "Analytics: login by Naveen"

ee.emit("logout", "Naveen"); // false — no listeners
```

---

## 2. `once()` — Listen for Exactly One Event

```js-exec
EventEmitter.prototype.once = function (eventName, callback) {
  const wrapper = (...args) => {
    callback.apply(this, args);
    this.off(eventName, wrapper); // Remove after first call
  };
  // Keep reference so user can remove by original callback
  wrapper._originalCallback = callback;
  return this.on(eventName, wrapper);
};

// Update off to handle once wrappers
EventEmitter.prototype.off = function (eventName, callback) {
  const callbacks = this._events[eventName];
  if (!callbacks) return this;

  this._events[eventName] = callbacks.filter(
    (cb) => cb !== callback && cb._originalCallback !== callback
  );
  return this;
};

// Test
const ee2 = new EventEmitter();

ee2.once("ready", () => console.log("Ready (only once!)"));

ee2.emit("ready"); // "Ready (only once!)"
ee2.emit("ready"); // (nothing — already removed)
console.log("Second emit had no effect");
```

---

## 3. `removeAllListeners` and `listenerCount`

```js-exec
EventEmitter.prototype.removeAllListeners = function (eventName) {
  if (eventName) {
    delete this._events[eventName];
  } else {
    this._events = {};
  }
  return this;
};

EventEmitter.prototype.listenerCount = function (eventName) {
  return this._events[eventName]?.length ?? 0;
};

EventEmitter.prototype.eventNames = function () {
  return Object.keys(this._events);
};

// Test
const ee3 = new EventEmitter();
ee3.on("a", () => {});
ee3.on("a", () => {});
ee3.on("b", () => {});

console.log("Events:", ee3.eventNames());     // ["a", "b"]
console.log("Count for 'a':", ee3.listenerCount("a")); // 2

ee3.removeAllListeners("a");
console.log("After removal:", ee3.eventNames()); // ["b"]
```

---

## 4. Wildcard / Catch-All Events — `"*"`

Node.js EventEmitter doesn't support wildcards, but you can add it:

```js-exec
class WildcardEmitter extends EventEmitter {
  emit(eventName, ...args) {
    // Emit to specific listeners
    const specific = super.emit(eventName, ...args);

    // Emit to catch-all ("*") listeners
    const wildcards = this._events["*"];
    if (wildcards) {
      for (const cb of wildcards) {
        cb.call(this, eventName, ...args);
      }
    }

    return specific || wildcards?.length > 0;
  }
}

const we = new WildcardEmitter();

we.on("click", () => console.log("click handler"));
we.on("*", (event, ...args) => console.log(`  [wildcard] "${event}" fired with:`, args));

we.emit("click", { x: 10, y: 20 });
we.emit("focus", { element: "input" });
```

---

## 5. Max Listeners Warning (Node.js Convention)

Node warns when more than 10 listeners are attached to one event:

```js-exec
EventEmitter.prototype.setMaxListeners = function (n) {
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.on = function (eventName, callback) {
  if (!this._events[eventName]) {
    this._events[eventName] = [];
  }
  const limit = this._maxListeners ?? 10;

  if (this._events[eventName].length >= limit) {
    console.warn(
      `Warning: Possible EventEmitter memory leak detected. ` +
      `${this._events[eventName].length + 1} "${eventName}" listeners added.`
    );
  }

  this._events[eventName].push(callback);
  return this;
};

const ee4 = new EventEmitter();
ee4.setMaxListeners(3);

for (let i = 0; i < 5; i++) {
  ee4.on("data", () => {});
}
// Last 2 additions trigger warnings
```

---

## Key Takeaways

- **`on(event, cb)`**: register a listener — returns `this` for chaining.
- **`emit(event, ...args)`**: call all listeners for that event synchronously.
- **`off(event, cb)`**: remove a specific listener by function reference.
- **`once(event, cb)`**: wrap the callback, auto-remove after first emit.
- **Wildcard `"*"`**: emit to both specific and catch-all listeners.
- Node.js `EventEmitter` is synchronous — listeners run in the order they were added.

---

**Next:** [Patterns #2 — Observer Pattern & Reactive Primitives](/articles/javascript-series/js-observer-pattern) — build a basic Observable with subscribe/unsubscribe/notify.
