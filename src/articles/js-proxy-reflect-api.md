`Proxy` wraps an object and intercepts fundamental operations — property access, assignment, deletion, function calls, and more. `Reflect` provides the default behavior for each trap.

**Think of a Proxy like a personal assistant.** When someone tries to ask you a question (read a property), your assistant intercepts it first. The assistant can: answer directly, modify the response, log the request, or block it entirely. The "real you" (the target object) doesn't even know someone asked. Together Proxy + Reflect enable validation, observables, negative array indices, and more.

**Prerequisites:** [JS Foundations #4 — Prototypes](/articles/javascript-series/js-prototypes-inheritance), [Symbols](/articles/javascript-series/js-symbols-in-depth)

---

## 1. Proxy Basics — Intercepting Property Access

A `Proxy` takes a target object and a handler with **traps** — functions that intercept operations:

```js-exec
const user = { name: "Naveen", role: "Engineer" };

const handler = {
  get(target, prop, receiver) {
    console.log(`Getting: ${String(prop)}`);
    if (prop in target) {
      return Reflect.get(target, prop, receiver);
    }
    return `Property "${String(prop)}" not found`;
  },
};

const proxy = new Proxy(user, handler);

console.log(proxy.name);     // Getting: name → "Naveen"
console.log(proxy.age);      // Getting: age → "Property "age" not found"
```

---

## 2. Why `Reflect`? — Not Just Convenience

Every Proxy trap has a matching `Reflect` method. You could write `target[prop]` instead of `Reflect.get(target, prop)`, but `Reflect` is better for three reasons:

1. **Correct `this` for getters:** `Reflect.get(target, prop, receiver)` passes the `receiver` (the proxy) as `this` when the property is a getter. `target[prop]` would use `target` as `this`, breaking getter behavior.
2. **Consistent return values:** `Reflect.set()` returns `true`/`false` (like strict-mode assignment). `target[prop] = value` just returns the value.
3. **No try/catch needed:** `Reflect.defineProperty()` returns `false` on failure instead of throwing.

```js-exec
// receiver matters for getters on the prototype chain:
const parent = {
  _name: "parent",
  get name() {
    return this._name;
  },
};

const child = Object.create(parent);
child._name = "child";

// Without receiver, getter sees parent's _name:
console.log(Reflect.get(parent, "name", child)); // "child" — correct (receiver = child)
console.log(parent.name);                        // "parent" — uses parent as this
```

---

## 3. Validation Proxy — Enforce Rules on Assignment

```js-exec
function createValidator(schema) {
  return new Proxy({}, {
    set(target, prop, value) {
      const rule = schema[prop];
      if (rule && !rule.validate(value)) {
        throw new Error(`Invalid value for ${String(prop)}: ${rule.message}`);
      }
      return Reflect.set(target, prop, value);
    },
    get(target, prop) {
      if (!(prop in target)) {
        throw new Error(`Property "${String(prop)}" does not exist`);
      }
      return Reflect.get(target, prop);
    },
  });
}

const user = createValidator({
  name: {
    validate: (v) => typeof v === "string" && v.length > 0,
    message: "Must be a non-empty string",
  },
  age: {
    validate: (v) => Number.isInteger(v) && v > 0 && v < 150,
    message: "Must be an integer between 1 and 149",
  },
});

user.name = "Naveen"; // OK
user.age = 25;        // OK

try {
  user.age = -5;
} catch (e) {
  console.log("Validation error:", e.message);
}

try {
  console.log(user.email);
} catch (e) {
  console.log("Access error:", e.message);
}
```

---

## 4. Negative Array Index Proxy

Python-like negative indices accessing from the end:

```js-exec
function negativeArray(arr) {
  return new Proxy(arr, {
    get(target, prop) {
      // Convert string index to number
      const index = Number(prop);

      if (!Number.isNaN(index) && index < 0) {
        // Negative index → from end
        return Reflect.get(target, target.length + index);
      }

      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      const index = Number(prop);
      if (!Number.isNaN(index) && index < 0) {
        return Reflect.set(target, target.length + index, value);
      }
      return Reflect.set(target, prop, value);
    },
  });
}

const arr = negativeArray([10, 20, 30, 40, 50]);

console.log(arr[-1]); // 50 (last element)
console.log(arr[-2]); // 40
console.log(arr[-5]); // 10
console.log(arr[0]);  // 10 (normal index still works)

arr[-1] = 99;
console.log(arr[4]);  // 99
```

---

## 5. Observable Object — Track Changes

Implement a basic reactive store that notifies subscribers on changes:

```js-exec
function observable(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value, receiver) {
      const old = Reflect.get(obj, prop);
      const result = Reflect.set(obj, prop, value, receiver);

      if (!Object.is(old, value)) {
        onChange(prop, old, value);
      }

      return result;
    },
    deleteProperty(obj, prop) {
      const had = prop in obj;
      const result = Reflect.deleteProperty(obj, prop);
      if (had) onChange(prop, Reflect.get(obj, prop), undefined);
      return result;
    },
  });
}

const state = observable(
  { count: 0, text: "hello" },
  (prop, oldVal, newVal) => {
    console.log(`  ${String(prop)}: ${oldVal} → ${newVal}`);
  }
);

state.count = 1;   // count: 0 → 1
state.count = 5;   // count: 1 → 5
state.text = "hi"; // text: hello → hi
delete state.text; // text: hi → undefined
```

---

## 6. All 13 Proxy Traps

```js-exec
const traps = {
  get: "target[prop] — reading a property",
  set: "target[prop] = value — writing a property",
  has: "prop in target — in operator",
  deleteProperty: "delete target[prop]",
  ownKeys: "Object.keys(), for...in, etc.",
  getOwnPropertyDescriptor: "Object.getOwnPropertyDescriptor()",
  defineProperty: "Object.defineProperty()",
  preventExtensions: "Object.preventExtensions()",
  isExtensible: "Object.isExtensible()",
  getPrototypeOf: "Object.getPrototypeOf()",
  setPrototypeOf: "Object.setPrototypeOf()",
  apply: "fn() — function call (target must be a function)",
  construct: "new Target() — new operator",
};

console.log("Proxy Traps:");
for (const [trap, desc] of Object.entries(traps)) {
  console.log(`  ${trap.padEnd(26)} — ${desc}`);
}

// Reflect has a matching method for every trap:
console.log("\nReflect methods mirror Proxy traps:");
console.log("  Reflect.get, Reflect.set, Reflect.has, Reflect.deleteProperty, ...");
```

---

## 7. Revocable Proxy

A proxy you can disable at any time — useful for access control that expires:

```js-exec
const { proxy, revoke } = Proxy.revocable(
  { secret: 42 },
  {
    get(target, prop) {
      if (prop === "secret") return "***REDACTED***";
      return Reflect.get(target, prop);
    },
  }
);

console.log(proxy.secret); // "***REDACTED***"

revoke(); // Disable the proxy

try {
  console.log(proxy.secret);
} catch (e) {
  console.log("Revoked:", e.message); // TypeError: Cannot perform 'get' on a proxy that has been revoked
}
```

---

## 8. Proxy Limitations — What CAN'T Be Intercepted

Not everything goes through traps. These operations bypass the Proxy entirely:

```js-exec
const obj = { name: "target" };
const proxy = new Proxy(obj, {
  get(target, prop) {
    console.log(`Getting: ${String(prop)}`);
    return Reflect.get(target, prop);
  },
});

// ❌ typeof always returns "object" for object proxies
console.log(typeof proxy); // "object" — does NOT trigger get trap

// ❌ Strict equality compares the proxy, not the target
console.log(proxy === obj); // false — they're different objects

// ❌ instanceof checks the prototype chain — target and proxy share it
console.log(proxy instanceof Object); // true — works because prototypes match

// ❌ Proxies have performance overhead — don't wrap every object
```

Proxies are for specific use cases (validation, observability, logging), not for blanket wrapping of all your data.

---

## Key Takeaways

- `Proxy(target, handler)` wraps an object and intercepts 13 fundamental operations via **traps**.
- `Reflect` provides the default behavior — always use `Reflect` for correct getter `this`, consistent returns, and no-throw semantics.
- The `receiver` parameter in traps is the proxy itself — critical for correct getter behavior on prototype chains.
- Use cases: **validation**, **negative indices**, **observables**, **lazy loading**, **access logging**.
- `Proxy.revocable()` creates a proxy you can later disable completely.
- Proxies can't intercept `typeof`, `===`, or direct `target` access — they wrap, they don't replace.

- `Proxy(target, handler)` wraps an object and intercepts 13 fundamental operations via **traps**.
- `Reflect` provides the default behavior — always use `Reflect` instead of direct `target[prop]` in traps.
- Use cases: **validation**, **negative indices**, **observables**, **lazy loading**, **access logging**.
- `Proxy.revocable()` creates a proxy you can later disable completely.
- Proxies are **transparent** — `proxy !== target` but `proxy instanceof Target` works.

---

**Next:** [Parsing #1 — Building a Simple `JSON.stringify()` ](/articles/javascript-series/js-json-stringify-parser) — understand the JSON grammar by implementing stringify.
