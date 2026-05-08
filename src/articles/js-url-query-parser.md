URL query strings encode structured data in a flat key-value format. Parsing them into objects — and building them back — is a common interview question and everyday utility. This article implements both directions from scratch.

**Prerequisites:** [Data #2 — Flatten & Unflatten Objects](/articles/javascript-series/js-flatten-unflatten-object)

---

## 1. Parse Query String → Object

```js-exec
function parseQueryString(queryString) {
  const result = {};

  // Remove leading ? or # if present
  const qs = queryString.replace(/^[?#]/, "");

  if (!qs) return result;

  for (const pair of qs.split("&")) {
    if (!pair) continue;

    const [rawKey, rawValue = ""] = pair.split("=");
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue);

    // Handle repeated keys → array
    if (key in result) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Test
console.log(parseQueryString("?name=Naveen&role=Engineer&tag=js&tag=react"));
// { name: "Naveen", role: "Engineer", tag: ["js", "react"] }

console.log(parseQueryString("?q=hello%20world&page=1"));
// { q: "hello world", page: "1" }

console.log(parseQueryString(""));
// {}
```

---

## 2. Object → Query String

```js-exec
function buildQueryString(obj) {
  const parts = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    const encodedKey = encodeURIComponent(key);

    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(`${encodedKey}=${encodeURIComponent(item)}`);
      }
    } else if (typeof value === "object") {
      // Nested objects — flatten or JSON-stringify them
      parts.push(`${encodedKey}=${encodeURIComponent(JSON.stringify(value))}`);
    } else {
      parts.push(`${encodedKey}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts.join("&");
}

// Test
const params = {
  name: "Naveen Karthik",
  role: "Engineer",
  tags: ["js", "react"],
  page: 1,
};

console.log("?" + buildQueryString(params));
// ?name=Naveen%20Karthik&role=Engineer&tags=js&tags=react&page=1
```

---

## 3. Parse Nested Query Keys (Bracket Notation)

Some APIs use `user[name]=Naveen&user[role]=Engineer` for nested data:

```js-exec
function parseNestedQuery(queryString) {
  const result = {};
  const qs = queryString.replace(/^[?#]/, "");

  if (!qs) return result;

  for (const pair of qs.split("&")) {
    if (!pair) continue;
    const [rawKey, rawValue = ""] = pair.split("=");
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue);

    // Parse bracket notation: user[address][city] → user.address.city
    const path = key.replace(/\]/g, "").split("[");
    let current = result;

    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      const isLast = i === path.length - 1;

      if (isLast) {
        current[segment] = value;
      } else {
        const nextSegment = path[i + 1];
        const nextIsArray = /^\d+$/.test(nextSegment);

        if (!(segment in current)) {
          current[segment] = nextIsArray ? [] : {};
        }
        current = current[segment];
      }
    }
  }

  return result;
}

console.log(parseNestedQuery("user[name]=Naveen&user[address][city]=Bangalore&user[tags][0]=js&user[tags][1]=react"));
// {
//   user: {
//     name: "Naveen",
//     address: { city: "Bangalore" },
//     tags: ["js", "react"]
//   }
// }
```

---

## 4. Parse URL — Extract Protocol, Host, Path, Query

```js-exec
function parseURL(url) {
  const result = {
    protocol: "",
    host: "",
    hostname: "",
    port: "",
    pathname: "/",
    search: "",
    hash: "",
  };

  // Extract hash
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    result.hash = url.slice(hashIndex);
    url = url.slice(0, hashIndex);
  }

  // Extract search (query)
  const searchIndex = url.indexOf("?");
  if (searchIndex !== -1) {
    result.search = url.slice(searchIndex);
    url = url.slice(0, searchIndex);
  }

  // Extract protocol
  const protoIndex = url.indexOf("://");
  if (protoIndex !== -1) {
    result.protocol = url.slice(0, protoIndex + 1); // "https:"
    url = url.slice(protoIndex + 3);
  }

  // Extract path
  const pathIndex = url.indexOf("/");
  if (pathIndex !== -1) {
    result.pathname = url.slice(pathIndex);
    url = url.slice(0, pathIndex);
  }

  // Extract port
  const portIndex = url.indexOf(":");
  if (portIndex !== -1) {
    result.port = url.slice(portIndex + 1);
    result.hostname = url.slice(0, portIndex);
  } else {
    result.hostname = url;
  }

  result.host = result.port ? `${result.hostname}:${result.port}` : result.hostname;

  return result;
}

const parsed = parseURL("https://example.com:8080/path/to/page?q=hello#section");
console.log(parsed);
// {
//   protocol: "https:",
//   host: "example.com:8080",
//   hostname: "example.com",
//   port: "8080",
//   pathname: "/path/to/page",
//   search: "?q=hello",
//   hash: "#section"
// }
```

---

## 5. Full URL Builder

```js-exec
function buildURL(parts) {
  let url = "";

  if (parts.protocol) url += `${parts.protocol}//`;
  url += parts.hostname || "";
  if (parts.port) url += `:${parts.port}`;
  url += parts.pathname || "/";
  if (parts.search) url += parts.search;
  if (parts.hash) url += parts.hash;

  return url;
}

const url = buildURL({
  protocol: "https:",
  hostname: "example.com",
  port: "3000",
  pathname: "/api/users",
  search: "?page=1&limit=10",
});

console.log(url); // https://example.com:3000/api/users?page=1&limit=10
```

---

## Key Takeaways

- Always use `encodeURIComponent()` / `decodeURIComponent()` when handling query string values.
- Repeated keys are conventionally parsed into arrays.
- Bracket notation (`user[name]`) converts to nested objects using path splitting.
- For production, use `URL` and `URLSearchParams` APIs — these implementations show the internals.
- A URL has 6 main parts: protocol, host (hostname + port), pathname, search, hash.

---

**Next:** [Parsing #3 — Building a Template Engine](/articles/javascript-series/js-string-templating-engine) — replace `{{ variables }}` and add loops and conditionals.
