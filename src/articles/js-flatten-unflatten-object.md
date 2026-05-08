Flattening converts a deeply nested object like `{ a: { b: { c: 1 } } }` into `{ "a.b.c": 1 }`. Unflattening reverses the process. This is a common coding interview question and has real uses in form libraries, URL parsers, and configuration systems.

**Prerequisites:** [Recursion Patterns](/articles/javascript-series/js-recursion-patterns)

---

## 1. Flatten an Object — Recursive Approach

```js-exec
function flatten(obj, parentKey = "", separator = ".") {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = parentKey ? `${parentKey}${separator}${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, flatten(value, fullKey, separator));
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

const nested = {
  name: "Naveen",
  address: {
    city: "Bangalore",
    country: "India",
    zip: { code: 560001 },
  },
  skills: ["JavaScript", "React"],
};

console.log(flatten(nested));
// {
//   name: "Naveen",
//   address.city: "Bangalore",
//   address.country: "India",
//   address.zip.code: 560001,
//   skills: ["JavaScript", "React"]
// }
```

Note: arrays are treated as leaf values — we don't flatten inside them by default.

---

## 2. Flatten with Configurable Separator and Array Handling

```js-exec
function flattenAdvanced(obj, options = {}) {
  const { separator = ".", prefix = "", flattenArrays = false } = options;
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}${separator}${key}` : key;

    if (Array.isArray(value)) {
      if (flattenArrays) {
        // Flatten array indices: arr[0], arr[1], ...
        for (let i = 0; i < value.length; i++) {
          const arrayKey = `${fullKey}${separator}${i}`;
          if (value[i] !== null && typeof value[i] === "object" && !Array.isArray(value[i])) {
            Object.assign(result, flattenAdvanced(value[i], { ...options, prefix: arrayKey }));
          } else {
            result[arrayKey] = value[i];
          }
        }
      } else {
        result[fullKey] = value;
      }
    } else if (value !== null && typeof value === "object" && !(value instanceof Date)) {
      Object.assign(result, flattenAdvanced(value, { ...options, prefix: fullKey }));
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

const data = {
  user: {
    name: "Naveen",
    addresses: [
      { city: "Bangalore", pin: 560001 },
      { city: "Mumbai", pin: 400001 },
    ],
  },
};

console.log("Without array flatten:");
console.log(flattenAdvanced(data));

console.log("\nWith array flatten:");
console.log(flattenAdvanced(data, { flattenArrays: true }));
```

---

## 3. Unflatten — Convert Flat Keys Back to Nested Objects

```js-exec
function unflatten(flatObj, separator = ".") {
  const result = {};

  for (const [key, value] of Object.entries(flatObj)) {
    const parts = key.split(separator);
    let current = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current[part] = value;
      } else {
        // If the next part is a number, create an array
        const nextPart = parts[i + 1];
        const nextIsIndex = /^\d+$/.test(nextPart);

        if (!(part in current)) {
          current[part] = nextIsIndex ? [] : {};
        }
        current = current[part];
      }
    }
  }

  return result;
}

const flat = {
  "user.name": "Naveen",
  "user.age": 25,
  "user.address.city": "Bangalore",
  "user.address.country": "India",
  "tags.0": "JavaScript",
  "tags.1": "React",
};

console.log(unflatten(flat));
// {
//   user: {
//     name: "Naveen",
//     age: 25,
//     address: { city: "Bangalore", country: "India" }
//   },
//   tags: ["JavaScript", "React"]
// }
```

---

## 4. Iterative Flatten — Stack-Safe for Deep Objects

```js-exec
function flattenIterative(obj, separator = ".") {
  const result = {};
  const stack = Object.entries(obj).map(([key, value]) => ({ key, value }));

  while (stack.length > 0) {
    const { key, value } = stack.pop();

    if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      for (const [subKey, subValue] of Object.entries(value)) {
        stack.push({ key: `${key}${separator}${subKey}`, value: subValue });
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Same result as recursive version — but can handle deeply nested objects
const result = flattenIterative({
  a: { b: { c: { d: { e: "deep" } } } },
});

console.log(result); // { "a.b.c.d.e": "deep" }
```

---

## 5. Real-World Use — Form Data to Nested Payload

Many form libraries represent `"user.address.city"` as a flat key. Unflatten it before sending to the API:

```js-exec
// Form data (flat)
const formData = {
  "user.name": "Naveen",
  "user.email": "naveen@example.com",
  "user.preferences.theme": "dark",
  "user.preferences.notifications": true,
};

// Convert to API payload
const payload = unflatten(formData);
console.log(JSON.stringify(payload, null, 2));
// API expects: { user: { name: "...", email: "...", preferences: { ... } } }

// Round-trip test
const reflat = flatten(payload);
console.log("Roundtrip check:", JSON.stringify(reflat) === JSON.stringify(formData));
```

---

## Key Takeaways

- **Flatten** recursively collects nested keys into `parent.child.grandchild` paths.
- **Unflatten** splits keys by separator and builds nested objects — handle numeric keys as array indices.
- Arrays can be kept as-is or flattened by index depending on the use case.
- The iterative approach with a **stack** avoids call stack overflow for deeply nested objects.
- This pattern is used in: form libraries, configuration merging, URL query parsers, and database ORMs.

---

**Next:** [Async #1 — The Event Loop in Depth](/articles/javascript-series/js-event-loop-in-depth) — call stack, microtask queue, macrotask queue, and the complete execution model of JavaScript.
