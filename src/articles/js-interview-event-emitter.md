An `EventEmitter` is a pub-sub pattern with `on`, `off`, `emit`, and `once`. Version I uses a listener array per event. Version II returns a subscription object with `unsubscribe()` — the modern pattern. The interviewer wants to see data structure choice and that you think about emit-during-emit.

**Related deep-dive:** [Patterns #1 — Event Emitter / Pub-Sub](/articles/js-event-emitter)

---

## What is an EventEmitter?

An `EventEmitter` is the **publish-subscribe (pub-sub) pattern** implemented as a class with four core methods: `on`, `off`, `emit`, and `once`. It lets objects communicate without directly referencing each other — listeners register interest in named events, and emitters broadcast events to whoever is listening.

This is the decoupling pattern that powers nearly every event-driven system:
- **DOM events** — `element.addEventListener("click", handler)` is the same pattern
- **Node.js core** — `EventEmitter` is a built-in module; streams, servers, and process objects all extend it
- **State management** — Redux, MobX, and Zustand all use pub-sub internally to notify subscribers of state changes
- **Micro-frontends / plugins** — independent modules communicate through a shared event bus without importing each other

The data structure is straightforward: a map from event name to an array of listener callbacks. The subtle behaviors that interviewers test:
- **`on(event, listener)`** — registers a listener; multiple listeners for the same event are called in registration order
- **`emit(event, ...args)`** — synchronously calls each registered listener with the provided arguments
- **`off(event, listener)`** — removes a specific listener; removing during `emit` shouldn't skip other listeners
- **`once(event, listener)`** — registers a listener that auto-removes after its first invocation (implemented by wrapping the listener with `on` + self-removing wrapper)

The upgrade path to version II is returning a **subscription object** with an `unsubscribe()` method instead of using `off(event, listener)`. This is the modern pattern (RxJS, React's `useEffect` cleanup) because the subscriber doesn't need to remember both the event name and the listener reference — they just call `.unsubscribe()`.

---

## The Problem

> "Implement an `EventEmitter` class with four methods: `on(event, listener)`, `off(event, listener)`, `emit(event, ...args)`, and `once(event, listener)`."
>
> "Version II: `on` returns a subscription object `{ unsubscribe() }` instead of using `off`."

---

## Thought Process

The data structure is a `Map<eventName, listener[]>`:
- `on` — push the listener to the array (create if needed)
- `off` — find and remove the listener from the array (reference equality)
- `emit` — iterate the array and call each listener with the args
- `once` — wrap the listener in a function that removes itself after the first call

For Version II, `on` returns `{ unsubscribe() { emitter.off(event, listener) } }` — the listener manages its own lifecycle.

---

## Step 1 — Base EventEmitter

```js-exec
class EventEmitter {
  constructor() {
    this._events = new Map();
  }

  on(event, listener) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }
    this._events.get(event).push(listener);
    return this;  // chainable
  }

  off(event, listener) {
    const listeners = this._events.get(event);
    if (!listeners) return this;
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
    return this;
  }

  emit(event, ...args) {
    const listeners = this._events.get(event);
    if (!listeners) return false;
    for (const listener of listeners) {
      listener(...args);
    }
    return true;  // true if there were listeners
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }
}

// Test
const emitter = new EventEmitter();
const log = [];

emitter.on('data', (msg) => log.push(`data: ${msg}`));
emitter.once('once', (msg) => log.push(`once: ${msg}`));
emitter.emit('data', 'hello');   // log: ['data: hello']
emitter.emit('once', 'first');   // log: ['data: hello', 'once: first']
emitter.emit('once', 'second');  // no effect — listener removed itself
console.log(log);
// ['data: hello', 'once: first']
```

---

## Step 2 — emit-during-emit Safety

The interviewer says: "What if a listener removes itself (or others) during `emit`?"

```js-exec
class EventEmitter {
  constructor() {
    this._events = new Map();
  }

  on(event, listener) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }
    this._events.get(event).push(listener);
    return this;
  }

  off(event, listener) {
    const listeners = this._events.get(event);
    if (!listeners) return this;
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
    return this;
  }

  emit(event, ...args) {
    const listeners = this._events.get(event);
    if (!listeners) return false;
    // Iterate a COPY to avoid mutation issues during emit
    for (const listener of [...listeners]) {
      listener(...args);
    }
    return true;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }
}
```

**The fix**: `[...listeners]` creates a shallow copy. Mutations during emit don't affect the iteration.

---

## Step 3 — Version II: Subscription Object

```js-exec
class EventEmitter {
  constructor() {
    this._events = new Map();
  }

  on(event, listener) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }
    this._events.get(event).push(listener);

    // Return subscription object
    return {
      unsubscribe: () => {
        this.off(event, listener);
      }
    };
  }

  off(event, listener) {
    const listeners = this._events.get(event);
    if (!listeners) return;
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  }

  emit(event, ...args) {
    const listeners = this._events.get(event);
    if (!listeners) return false;
    for (const listener of [...listeners]) {
      listener(...args);
    }
    return true;
  }

  once(event, listener) {
    const sub = this.on(event, (...args) => {
      sub.unsubscribe();
      listener(...args);
    });
    return sub;
  }
}

// Test
const emitter = new EventEmitter();
const sub = emitter.on('data', (msg) => console.log(msg));
emitter.emit('data', 'hello');  // 'hello'
sub.unsubscribe();
emitter.emit('data', 'hello');  // nothing — unsubscribed
```

---

## Step 4 — Edge Cases

**Emit with no listeners**: Return `false` (or `undefined`). Don't throw.

**Remove non-existent listener**: Silently return — same as native `EventTarget.removeEventListener`.

**Same listener added twice**: Both registrations fire on emit. `off` removes only the first match.

**Once listener removed manually**: The wrapper is stored in the array. Calling `off` with the original listener won't find it — the wrapper is a different reference. This is expected behavior.

---

## Full Solution

```js-exec
class EventEmitter {
  constructor() {
    this._events = new Map();
  }

  on(event, listener) {
    if (!this._events.has(event)) this._events.set(event, []);
    this._events.get(event).push(listener);
    return { unsubscribe: () => this.off(event, listener) };
  }

  off(event, listener) {
    const listeners = this._events.get(event);
    if (!listeners) return;
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  }

  emit(event, ...args) {
    const listeners = this._events.get(event);
    if (!listeners) return false;
    for (const listener of [...listeners]) listener(...args);
    return true;
  }

  once(event, listener) {
    const sub = this.on(event, (...args) => {
      sub.unsubscribe();
      listener(...args);
    });
    return sub;
  }
}
```

---

## What Interviewers Are Testing

- **Pub-sub pattern** — the core observer design pattern
- **Data structure choice** — Map of arrays for O(1) event lookup
- **emit-during-emit safety** — iterating a copy to avoid mutation issues
- **Subscription pattern** — returning a handle that controls listener lifecycle
- **Closure for `once`** — wrapping a listener with self-removal logic

---

## Complexity

| | Time | Space |
|-|------|-------|
| on | O(1) | O(1) |
| off | O(L) — L listeners per event | O(1) |
| emit | O(L) — iterates all listeners | O(L) — copy of listeners |
| once | O(1) | O(1) |

---

## Interview Tips

- **Choose Map over object** — "I'll use a Map so I can emit events named after Object.prototype properties like `toString` or `constructor` without collision."
- **Copy before iterating in emit** — `[...listeners]` prevents bugs when a listener removes itself during emission.
- **Show Version II naturally** — "Many modern event systems return a subscription object instead of using `off`. Here's that version."
- **Mention EventTarget and EventEmitter** — the browser uses `EventTarget` (addEventListener/removeEventListener); Node.js uses `EventEmitter`. Yours is the Node.js style.

---

## Related Questions

- [Implement classnames()](/articles/js-interview-classnames)
- [Implement once()](/articles/js-interview-once)
- [Implement memoize()](/articles/js-interview-memoize)
