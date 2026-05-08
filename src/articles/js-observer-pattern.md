The Observer pattern is the foundation of reactive programming — RxJS, React's state management, signal libraries, and Redux all trace back to this pattern. An Observable (subject) maintains a list of Observers (subscribers) and notifies them when its state changes. This article builds it from scratch.

**Prerequisites:** [Patterns #1 — Event Emitter](/articles/javascript-series/js-event-emitter)

---

## 1. Basic Observable — Subscribe, Unsubscribe, Notify

```js-exec
class Observable {
  constructor() {
    this._observers = [];
  }

  subscribe(observer) {
    this._observers.push(observer);
    return () => this.unsubscribe(observer); // Return unsubscribe function
  }

  unsubscribe(observer) {
    this._observers = this._observers.filter((o) => o !== observer);
  }

  notify(data) {
    for (const observer of this._observers) {
      observer(data);
    }
  }
}

// Test
const store = new Observable();

const unsub1 = store.subscribe((data) => console.log("Observer 1:", data));
const unsub2 = store.subscribe((data) => console.log("Observer 2:", data));

store.notify({ count: 1 });
// Observer 1: { count: 1 }
// Observer 2: { count: 1 }

unsub1(); // Remove observer 1
store.notify({ count: 2 });
// Observer 2: { count: 2 }
```

---

## 2. Observable with State — Basic Store

```js-exec
class Store {
  constructor(initialState = {}) {
    this._state = initialState;
    this._listeners = [];
  }

  getState() {
    return this._state;
  }

  subscribe(listener) {
    this._listeners.push(listener);
    // Immediately call with current state
    listener(this._state);
    return () => this._listeners = this._listeners.filter((l) => l !== listener);
  }

  setState(updater) {
    const newState =
      typeof updater === "function" ? updater(this._state) : updater;

    if (newState !== this._state) {
      this._state = newState;
      this._notify();
    }
  }

  _notify() {
    for (const listener of this._listeners) {
      listener(this._state);
    }
  }
}

// Test — like a mini Redux:
const counter = new Store({ count: 0 });

counter.subscribe((state) => console.log("State changed:", state));

counter.setState((prev) => ({ count: prev.count + 1 })); // { count: 1 }
counter.setState((prev) => ({ count: prev.count + 1 })); // { count: 2 }
```

---

## 3. Computed Values — Derived State

```js-exec
class Computed {
  constructor(dependencies, computeFn) {
    this._deps = dependencies;
    this._computeFn = computeFn;
    this._value = this._computeFn();
    this._listeners = [];

    // Recompute when any dependency changes
    for (const dep of this._deps) {
      dep.subscribe(() => {
        this._value = this._computeFn();
        this._notify();
      });
    }
  }

  get value() {
    return this._value;
  }

  subscribe(listener) {
    this._listeners.push(listener);
    return () => this._listeners = this._listeners.filter((l) => l !== listener);
  }

  _notify() {
    for (const listener of this._listeners) {
      listener(this._value);
    }
  }
}

// Test: computed that depends on a store
const price = new Store({ amount: 100 });
const tax = new Store({ rate: 0.1 });

const total = new Computed([price, tax], () => {
  return price.getState().amount * (1 + tax.getState().rate);
});

console.log("Initial total:", total.value); // 110

price.setState({ amount: 200 });
console.log("After price change:", total.value); // 220
```

---

## 4. Simple Signal Implementation

Signals are the 2024-era evolution of the observer pattern — fine-grained reactive primitives:

```js-exec
function signal(initialValue) {
  let value = initialValue;
  const listeners = new Set();

  function read() {
    return value;
  }

  function write(newValue) {
    if (newValue !== value) {
      value = newValue;
      for (const listener of listeners) {
        listener(value);
      }
    }
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { read, write, subscribe };
}

// Test a mini signal-based counter
const count = signal(0);

count.subscribe((v) => console.log("Signal:", v));

count.write(1); // Signal: 1
count.write(2); // Signal: 2
count.write(2); // (no log — value didn't change)
console.log("Final:", count.read()); // 2
```

---

## 5. Observer vs Event Emitter vs Pub-Sub

```js-exec
console.log("│ Pattern        │ Communication    │ Coupling                     │");
console.log("│────────────────│──────────────────│──────────────────────────────│");
console.log("│ Observer       │ Subject → Observers│ Tight-ish — subject knows  │");
console.log("│                │ (direct)         │ observers directly           │");
console.log("│ Event Emitter  │ Emitter → Listeners│ Loose — same object        │");
console.log("│ Pub-Sub        │ Publisher → Broker│ Very loose — publisher and │");
console.log("│                │ → Subscribers     │ subscriber don't know       │");
console.log("│                │ (through broker)  │ about each other            │");
```

Observer: Subject maintains a list and calls them. Event Emitter: Listeners register on the emitter object. Pub-Sub: A broker/event bus sits between publishers and subscribers — neither knows about the other.

---

## Key Takeaways

- **Observable** maintains a list of observers and notifies them when state changes.
- Return an **unsubscribe function** from `subscribe()` — avoids listener leaks.
- **Computed values** auto-recompute when their dependencies change.
- **Signals** are fine-grained observables — each value tracks its own set of listeners.
- Skip notification if the new value **equals** the old value to prevent infinite update loops.

---

**Next:** [Patterns #3 — Singleton, Factory & Constructor](/articles/javascript-series/js-singleton-factory-patterns) — compare object creation patterns and when each fits.
