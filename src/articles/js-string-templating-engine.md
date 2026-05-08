Template engines replace placeholders with data — Handlebars, Mustache, even React's JSX compiles to something similar. This article builds a minimal template engine that handles variable interpolation, loops, and conditionals using regex.

**Prerequisites:** [JS Foundations #8 — Template Literals](/articles/javascript-series/js-template-literals)

---

## 1. Simple Variable Replacement — `{{ var }}`

```js-exec
function template(str, data) {
  return str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    // Handle dot notation: user.name → data.user.name
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);
    return value ?? "";
  });
}

const tpl = "Hello, {{ user.name }}! You have {{ count }} new messages.";
const data = {
  user: { name: "Naveen" },
  count: 5,
};

console.log(template(tpl, data));
// "Hello, Naveen! You have 5 new messages."
```

---

## 2. Conditionals — `{{#if}}` and `{{/if}}`

```js-exec
function templateWithIf(str, data) {
  // Handle {{#if condition}} ... {{/if}}
  str = str.replace(
    /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, path, content) => {
      const value = path.split(".").reduce((obj, key) => obj?.[key], data);
      return value ? content : "";
    }
  );

  // Handle {{#unless condition}} ... {{/unless}}
  str = str.replace(
    /\{\{#unless\s+([\w.]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
    (match, path, content) => {
      const value = path.split(".").reduce((obj, key) => obj?.[key], data);
      return !value ? content : "";
    }
  );

  // Variable interpolation
  str = str.replace(
    /\{\{\s*([\w.]+)\s*\}\}/g,
    (match, path) => {
      const value = path.split(".").reduce((obj, key) => obj?.[key], data);
      return value ?? "";
    }
  );

  return str;
}

const tpl = `
  <h1>Welcome{{#if user.name}}, {{ user.name }}{{/if}}!</h1>
  {{#if isAdmin}}<p>Admin panel access granted</p>{{/if}}
  {{#unless isActive}}<p>Account is inactive</p>{{/unless}}
`;

console.log(
  templateWithIf(tpl, {
    user: { name: "Naveen" },
    isAdmin: true,
    isActive: false,
  })
);
// <h1>Welcome, Naveen!</h1>
// <p>Admin panel access granted</p>
// <p>Account is inactive</p>
```

---

## 3. Loops — `{{#each}}` and `{{/each}}`

```js-exec
function templateWithEach(str, data) {
  // Handle {{#each items}} ... {{/each}}
  str = str.replace(
    /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (match, path, content) => {
      const items = path.split(".").reduce((obj, key) => obj?.[key], data);

      if (!Array.isArray(items)) return "";

      return items
        .map((item, index) => {
          return content.replace(/\{\{\s*this\s*\}\}/g, item).replace(/\{\{\s*@index\s*\}\}/g, index);
        })
        .join("");
    }
  );

  // Variable interpolation
  str = str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);
    return value ?? "";
  });

  return str;
}

const tpl = `
<ul>
  {{#each items}}<li>{{ @index }}: {{ this }}</li>{{/each}}
</ul>`;

console.log(
  templateWithEach(tpl, {
    items: ["JavaScript", "React", "Node.js"],
  })
);
// <ul>
//   <li>0: JavaScript</li>
//   <li>1: React</li>
//   <li>2: Node.js</li>
// </ul>
```

---

## 4. Full Engine — if, unless, each, and variables

Combining everything into one function:

```js-exec
function render(templateStr, data) {
  let result = templateStr;

  // Process blocks (each, if, unless) — handle them before simple vars
  const blockRegex =
    /\{\{(#each|#if|#unless)\s+([\w.]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;

  result = result.replace(blockRegex, (match, type, path, content) => {
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);

    if (type === "#each" && Array.isArray(value)) {
      return value
        .map((item, i) =>
          content
            .replace(/\{\{\s*this\s*\}\}/g, item)
            .replace(/\{\{\s*@index\s*\}\}/g, i)
        )
        .join("");
    }

    if (type === "#if") return value ? content : "";
    if (type === "#unless") return !value ? content : "";

    return "";
  });

  // Process simple variables
  result = result.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);
    return value ?? "";
  });

  return result;
}

// Comprehensive test
const page = `
<div>
  <h1>{{ title }}</h1>

  {{#if showList}}
  <ul>
    {{#each items}}<li>{{ this }}</li>{{/each}}
  </ul>
  {{/if}}

  {{#unless isLoggedIn}}
  <p>Please log in to continue.</p>
  {{/unless}}
</div>`;

console.log(
  render(page, {
    title: "Dashboard",
    showList: true,
    items: ["Analytics", "Reports", "Settings"],
    isLoggedIn: false,
  })
);
// Renders title, list of 3 items, and login prompt
```

---

## 5. Escaping — Preventing HTML Injection

Always escape user-supplied data in templates:

```js-exec
function escape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSafe(templateStr, data) {
  let result = templateStr;

  // {{ expression }} → escaped
  result = result.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);
    return escape(value ?? "");
  });

  // {{{ expression }}} → raw (unescaped) — use with caution!
  result = result.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (match, path) => {
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);
    return value ?? "";
  });

  return result;
}

// {{ }} escapes, {{{ }}} outputs raw
const userComment = "<script>alert('xss')</script>";
console.log("Escaped:", renderSafe("User said: {{ comment }}", { comment: userComment }));
console.log("Raw:", renderSafe("User said: {{{ comment }}}", { comment: userComment }));
```

---

## Key Takeaways

- Regex `\{\{\s*([\w.]+)\s*\}\}` matches template variables with optional dot notation.
- Block helpers (`#each`, `#if`, `#unless`) need regex that handles nested content (basic `[\s\S]*?`).
- Dot-notation path resolution: split by `.`, reduce over the data object.
- Always **escape** user data in templates with `{{{ }}}` reserved for trusted HTML.
- This pattern scales to handlebars/mustache/liquid — the regex engine just gets more sophisticated.

---

**Next:** [V8 #1 — JIT Compilation & Hidden Classes](/articles/javascript-series/js-v8-jit-compilation) — how V8's Ignition and TurboFan make JavaScript fast.
