Singleton ensures one instance; Factory abstracts object creation; Constructor vs Factory is an architectural choice. This article compares all three with runnable examples and explains when each makes sense in JavaScript.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. Singleton — One Instance, Guaranteed

```js-exec
// Approach 1: Module-level instance (ESM naturally creates singletons)
// In a real ESM file, the module runs once and exports are cached.
let instance = null;

class Database {
  constructor() {
    if (instance) return instance;
    console.log("Creating database connection...");
    this.connected = true;
    instance = this;
  }

  query(sql) {
    return `Results for: ${sql}`;
  }
}

const db1 = new Database(); // "Creating database connection..."
const db2 = new Database(); // (silent — returns existing instance)
console.log("Same instance?", db1 === db2); // true
```

Closure-based singleton:

```js-exec
function createLogger() {
  let instance = null;

  return class Logger {
    constructor() {
      if (instance) return instance;
      this.logs = [];
      instance = this;
    }

    log(msg) {
      this.logs.push(msg);
      console.log("[LOG]", msg);
    }

    get count() {
      return this.logs.length;
    }
  };
}

const Logger = createLogger();
const log1 = new Logger();
const log2 = new Logger();

log1.log("Message 1");
log2.log("Message 2");
console.log("Same instance?", log1 === log2); // true
console.log("Both see 2 logs:", log2.count); // 2
```

---

## 2. Factory Function — Create Objects Without `new`

Factory functions hide creation complexity and can return different implementations:

```js-exec
function createUser(type, name) {
  const base = {
    name,
    createdAt: new Date(),
  };

  switch (type) {
    case "admin":
      return {
        ...base,
        role: "admin",
        permissions: ["read", "write", "delete"],
        canDelete: true,
      };

    case "editor":
      return {
        ...base,
        role: "editor",
        permissions: ["read", "write"],
        canDelete: false,
      };

    default:
      return {
        ...base,
        role: "viewer",
        permissions: ["read"],
        canDelete: false,
      };
  }
}

const admin = createUser("admin", "Naveen");
const viewer = createUser("viewer", "Guest");

console.log(admin.role, "→ permissions:", admin.permissions); // admin → ["read", "write", "delete"]
console.log(viewer.role, "→ permissions:", viewer.permissions); // viewer → ["read"]

// No 'new' keyword needed — and no 'instanceof' issues
```

---

## 3. Constructor Function vs Factory Function

```js-exec
// Constructor — uses 'new', has prototype chain, instanceof works
function UserConstructor(name) {
  this.name = name;
}
UserConstructor.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

// Factory — no 'new', creates object directly, uses closures for privacy
function createUserFactory(name) {
  const privateId = Math.random().toString(36).slice(2);

  return {
    name,
    greet() {
      return `Hi, I'm ${name}`;
    },
    getPrivateId() {
      return privateId; // Truly private — not accessible otherwise
    },
  };
}

const constUser = new UserConstructor("Naveen");
const factUser = createUserFactory("Karthik");

console.log(constUser.greet());           // "Hi, I'm Naveen"
console.log(constUser instanceof UserConstructor); // true

console.log(factUser.greet());           // "Hi, I'm Karthik"
console.log(factUser instanceof Object);  // true (but NOT UserFactory)
console.log("Private ID:", factUser.getPrivateId()); // accessible
console.log("Direct access:", factUser.privateId);   // undefined — truly private
```

---

## 4. When to Use Which

```js-exec
console.log("│ Pattern        │ When to Use                              │");
console.log("│────────────────│──────────────────────────────────────────│");
console.log("│ Singleton      │ Shared resource (DB, logger, config)     │");
console.log("│                │ State that must be global                 │");
console.log("│ Factory        │ Complex object creation                   │");
console.log("│                │ Multiple variants from same template      │");
console.log("│                │ Need private state without WeakMaps       │");
console.log("│ Constructor    │ Need instanceof checks                    │");
console.log("│                │ Shared prototype methods (memory efficient)│");
console.log("│                │ Classical OOP style                       │");

// In practice:
// - ES modules are already singletons in most bundlers
// - React components use factory-ish hooks + closures
// - Classes/constructors when you need prototypes or instanceof
```

---

## Key Takeaways

- **Singleton**: one instance — ESM modules are natural singletons; closures can enforce it.
- **Factory**: creates objects without `new` — can return different shapes, hide implementation, use true private state.
- **Constructor**: needs `new` — has prototype chain, `instanceof`, shared methods (memory efficient).
- In modern JS, factories + closures often replace constructors — composition over inheritance.
- Use the pattern that fits the problem, not the pattern you're most comfortable with.

---

**Next:** [Data Structures #1 — Linked List](/articles/javascript-series/js-linked-list) — implement singly and doubly linked lists with all operations.
