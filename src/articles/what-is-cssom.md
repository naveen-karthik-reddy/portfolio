The **CSSOM** (CSS Object Model) is the browser's internal tree representation of all the CSS that applies to a page. It's the CSS equivalent of the DOM — where the DOM maps the HTML structure, the CSSOM maps all selectors to their computed style values.

---

## How the browser builds it

When the browser encounters a `<link rel="stylesheet">` or a `<style>` block, it:

1. Downloads the stylesheet (if external)
2. Parses it token by token into a tree of CSS rules
3. Resolves specificity, inheritance, and cascade for every rule
4. Produces a map of selectors → fully computed styles

By the time the CSSOM is built, every element has a complete, resolved set of CSS properties — including values inherited from parent elements and defaults from the browser's user-agent stylesheet.

---

## Why it blocks rendering

The browser **will not produce any pixels until the CSSOM is fully built**. This makes CSS render-blocking by default.

The reason is safety: rendering the page without complete style information would produce a flash of unstyled content — elements appearing in their default browser styles, then immediately jumping to their correct appearance as CSS arrives. The browser prefers to wait rather than show users that flicker.

```html
<!-- This blocks rendering until the full file is downloaded and parsed -->
<link rel="stylesheet" href="styles.css">
```

Every kilobyte in your stylesheet is on the critical rendering path. Unused rules, large framework bundles, and slow CDNs all delay first paint.

---

## Cascade, specificity, and inheritance

The CSSOM is where CSS's cascade rules are applied:

- **Specificity** — more specific selectors win (`#id` beats `.class` beats `div`)
- **Source order** — when specificity is equal, the later rule wins
- **Inheritance** — properties like `color` and `font-size` flow from parent to child
- **`!important`** — overrides the cascade for that property

By the time the browser moves on to building the Render Tree, all of this has been resolved. There's no ambiguity left — every element has one computed value per property.

---

## CSSOM + DOM = Render Tree

The browser merges the DOM and CSSOM into the **Render Tree** — a new structure containing only visible nodes with their fully computed styles attached. Elements with `display: none` are excluded. Pseudo-elements like `::before` are included even though they don't exist in the DOM.

The Render Tree is what layout and paint operate on. Neither step can begin until both the DOM and CSSOM are ready.

---

## What this means for performance

- **Inline critical styles** (`<style>` in `<head>`) to eliminate the stylesheet network round-trip for above-the-fold content
- **Load non-critical CSS asynchronously** so it doesn't block the initial render
- **Remove unused CSS** — fewer rules means a smaller file and faster parse time

The CSSOM is often overlooked compared to JavaScript blocking, but a large stylesheet on a slow connection can delay first paint just as badly as a render-blocking script.
