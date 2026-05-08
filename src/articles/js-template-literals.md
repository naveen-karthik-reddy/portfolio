Template literals are more than string interpolation — they support multiline strings without escape characters, nested expressions, and **tagged templates** that let you process template strings with a function. This article covers all three capabilities with runnable examples.

**Prerequisites:** [JS Foundations #1 — Variables & Scope](/articles/javascript-series/js-variables-scope-hoisting)

---

## 1. Basic Template Literals — Interpolation

Template literals use backticks (`` ` ``) instead of quotes. Expressions inside `${ }` are evaluated and inserted:

```js-exec
const name = "Naveen";
const role = "Frontend Engineer";
const years = 5;

// Old way — concatenation
const old = name + " is a " + role + " with " + years + " years of experience.";

// Template literal
const modern = `${name} is a ${role} with ${years} years of experience.`;

console.log(old);
console.log(modern);
console.log("Same?", old === modern);
```

Any expression works inside `${}` — function calls, ternary operators, math, even nested template literals:

```js-exec
function getYear() {
  return 2026;
}

const user = { name: "Naveen", active: true };

const message = `User ${user.name} is ${user.active ? "active" : "inactive"}.
Year: ${getYear()}
Next year: ${getYear() + 1}
2 + 2 = ${2 + 2}`;

console.log(message);
```

---

## 2. Multiline Strings

Template literals preserve newlines — no more `\n` or string concatenation for multiline content:

```js-exec
// Old way — \n escapes
const oldHtml =
  "<div>\n" +
  "  <h1>Title</h1>\n" +
  "  <p>Content</p>\n" +
  "</div>";

// Template literal — write it exactly how you want it
const newHtml = `<div>
  <h1>Title</h1>
  <p>Content</p>
</div>`;

console.log("Old HTML:");
console.log(oldHtml);
console.log("\nNew HTML:");
console.log(newHtml);
```

Be mindful of indentation — whitespace inside the backticks is preserved:

```js-exec
const indented = `
  Line 1
  Line 2
    Line 3 (deeper)
`;

console.log(indented);
// The leading newline and spaces are included!
```

---

## 3. Nesting Template Literals

You can nest template literals inside `${}` — useful for conditional rendering:

```js-exec
const items = ["Apple", "Banana", "Cherry"];
const showList = true;

const html = `
<ul>
  ${showList
    ? items.map((item) => `<li>${item}</li>`).join("\n  ")
    : "<li>No items</li>"
  }
</ul>`;

console.log(html);
```

---

## 4. Tagged Templates — Processing with a Function

A **tagged template** is a function call where the template literal is broken into pieces and passed to a function. Here's how the engine splits the template:

```
tag`Hello ${name}, you are ${age} years old`
         ┬              ┬
         └── value[0]   └── value[1]

strings: ["Hello ", ", you are ", " years old"]  ← always one more than values
values:  [  name  ,      age     ]
```

The tag function stitches them back together however it wants.

```js-exec
// The tag function receives:
// - strings: array of literal string parts
// - ...values: interpolated expression results
function tag(strings, ...values) {
  console.log("Strings:", strings);
  console.log("Values:", values);

  // Recombine manually
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += `[${values[i]}]`; // Wrap each value in brackets
    }
  }
  return result;
}

const x = 10;
const y = 20;

console.log(tag`The sum of ${x} and ${y} is ${x + y}`);
// Output: The sum of [10] and [20] is [30]
```

The `strings` array always has one more element than `values`. The raw template parts (including escape sequences) are accessible via `strings.raw`.

---

## 5. Practical Tag — Building a Styled-Components–like Function

Build a CSS-in-JS function similar to how styled-components works:

```js-exec
// Simple CSS tag — converts kebab-case to camelCase and combines
function css(strings, ...values) {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) result += values[i];
  }
  return result.trim().replace(/\s+/g, " ");
}

const color = "red";
const fontSize = 16;

const styles = css`
  color: ${color};
  font-size: ${fontSize}px;
  margin: 8px;
`;

console.log(styles);
```

---

## 6. Practical Tag — Safe HTML Escaping

A tag function that escapes HTML to prevent XSS:

```js-exec
function safeHtml(strings, ...values) {
  const escape = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += escape(values[i]) + strings[i + 1];
  }
  return result;
}

const userInput = '<script>alert("XSS")</script>';
const safe = safeHtml`<div>User said: ${userInput}</div>`;

console.log(safe);
// → <div>User said: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>
```

Compare with dangerously injecting unescaped input:

```js-exec
const userInput = '<script>alert("XSS")</script>';
const unsafe = `<div>User said: ${userInput}</div>`;

console.log("Unsafe (raw):", unsafe);
// This is why you never use innerHTML with user input
```

---

## 7. Practical Tag — Styled Components Lite

A minimal CSS-in-JS tag that auto-injects styles into the DOM:

```js-exec
function styled(strings, ...values) {
  let css = "";
  for (let i = 0; i < strings.length; i++) {
    css += strings[i];
    if (i < values.length) css += values[i];
  }

  // In a real app, generate a unique class name and inject into <style>
  const className = "css-" + Math.random().toString(36).slice(2, 8);

  const styleEl = document.createElement("style");
  styleEl.textContent = `.${className} { ${css} }`;
  document.head.appendChild(styleEl);

  return className;
}

// This generates a class and injects the CSS:
const btnClass = styled`
  background: #4f46e5;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
`;

console.log("Generated class name:", btnClass);
console.log("Check <head> for the injected <style> tag");
```

---

## 8. `String.raw` — Raw Strings

`String.raw` is a built-in tag that treats escape sequences as literal characters:

```js-exec
// Without String.raw — \n becomes a newline
console.log(`Line1\nLine2`);

// With String.raw — \n stays as literal \ n
console.log(String.raw`Line1\nLine2`);

// Useful for regex patterns and Windows paths
const path = String.raw`C:\Users\Naveen\Desktop`;
console.log(path); // C:\Users\Naveen\Desktop — backslashes preserved
```

---

## Key Takeaways

- Template literals use backticks and `${expr}` for interpolation — cleaner than concatenation.
- Multiline strings are preserved as-is — no `\n` escapes needed.
- **Tagged templates** let a function process the literal parts and interpolated values — the foundation of styled-components, GraphQL template literals, and safe HTML libraries.
- `String.raw` preserves escape sequences as literal characters — useful for regex and Windows paths.
- Always escape user input in HTML templates — tagged templates make this systematic.

---

**Next:** [Functions #1 — `call()`, `apply()` & `bind()` Polyfills](/articles/javascript-series/js-call-apply-bind) — implement each method from scratch and understand how they control `this`.
