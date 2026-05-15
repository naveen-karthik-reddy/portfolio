---
name: create-article
description: Create a complete article end-to-end — writes markdown, registers in articlesData.js, generates cover image, converts to WebP, adds cross-references.
---

# create-article

Create a new article and do ALL the follow-up steps without asking the user what to do next.

## When to invoke

This skill fires when the user says any of:
- "create an article about..."
- "write a new article..."
- "add an article for..."
- "/create-article"

## What this skill does

It completes every step needed to ship a new article: write the markdown, register it in the data file, generate the cover image, convert to webp, and add cross-references.

---

## Step 1 — Gather requirements

Ask the user ONLY these two things (if not already clear from the request):

1. **Article slug** — e.g. `what-is-parsing`, `js-promise-any`, `06-event-loop-task-queue`
2. **Article type** — one of:
   - `glossary` — short "What is X?" explainer (~60-90 lines, 4-5 min read)
   - `performance` — numbered Performance #N article (~180-200 lines, 8-10 min read)
   - `javascript` — deep-dive JS tutorial with runnable examples (~150-300 lines)
   - `react` — React internals article
   - `product` — project/product page article

Do NOT ask anything else. Proceed to writing immediately after getting these two answers.

Do NOT ask "where should I put it?", "what format?", "do you want me to generate an image?" — the skill handles all of that.

---

## Step 2 — Write the markdown file

Create `src/articles/<slug>.md`.

### Style rules by type

**glossary** ("what-is-*"):
- First line: bolded one-sentence definition
- ~60-90 lines total
- `##` headings with `---` horizontal rule separators between sections
- Practical code examples with ❌/✅ pattern where applicable
- Markdown comparison tables where helpful
- Cross-link to related articles inline using `/articles/<other-slug>` paths
- Last section should link to broader context (e.g. "See also the [rendering pipeline](/articles/01-browser-rendering-pipeline)...")
- Read like the existing files: `what-is-dom.md`, `what-is-cssom.md`, `what-is-parsing.md`
- Tone: educational, self-contained, concise

**performance**:
- Number in title: `Performance #N — Title Here`
- ~180-200 lines
- Practical code snippets with ❌/✅
- Tables summarising actions/impact
- "Where to Go Next" section at bottom linking to adjacent articles

**javascript**:
- Reference existing files in `src/articles/js-*.md` for tone and depth
- Include editable/runnable code examples where applicable

### Image references in markdown

You can reference the cover image inside the article body if needed, but the component already renders it at the top. No image tag is required in the markdown itself.

---

## Step 3 — Register in articlesData.js

File: `src/data/articlesData.js`

Add an entry inside the appropriate section array. Sections are marked with comments like:

```
/* ═══════════════ Glossary — Browser Fundamentals ═══════════════ */
```

### Entry template

```js
  {
    id: "<slug>",
    image: "<slug>.webp",
    title: "Article Title Here",
    excerpt: "One to two sentence summary that makes someone want to read it.",
    readTime: "X min read",
    tags: ["Tag1", "Tag2", "Tag3"],
    categories: ["cat1", "cat2"],
  },
```

### Sections and their tags/categories

- **Glossary — Browser Fundamentals**: tags like `["Browser", "Performance", "Fundamentals"]`, categories `["performance", "fundamentals"]`
- **Glossary — JavaScript & Runtime**: tags like `["JavaScript", "Event Loop", "Fundamentals"]`, categories `["javascript", "fundamentals"]`
- **Glossary — React**: tags like `["React", "Fundamentals"]`, categories `["react", "fundamentals"]`
- **Glossary — Network & Performance Metrics**: tags like `["Performance", "Network", "Fundamentals"]`, categories `["performance", "fundamentals"]`
- **Performance series**: tags like `["Performance", "Browser", "Fundamentals"]`, categories `["performance"]`
- **JavaScript series**: tags like `["JavaScript", "Functions", "Polyfill"]`, categories `["javascript"]`
- **React deep-dive**: tags like `["React", "Performance", "Browser"]`, categories `["react", "performance"]`
- **Product articles**: tags vary, categories `["product"]`

---

## Step 4 — Generate the cover image

Run this exact command:

```bash
node generate-article-images.mjs --article <slug>
```

This creates `public/articles/images/<slug>.png`. It skips if the file already exists.

The script uses Gemini image generation with the project's editorial style prompt (gold border, `#f6f3eb` background, topic badge, footer branding). This takes ~15-30 seconds.

---

## Step 5 — Convert PNG to WebP

```bash
node convert-to-webp.mjs <slug>.png
```

This creates `public/articles/images/<slug>.webp` alongside the `.png`.

---

## Step 6 — Add cross-references (if applicable)

If this new article is a glossary entry that existing performance/javascript articles should link to, update those markdown files to add inline links. For example:

- A `what-is-parsing` article → add `[parsing](/articles/what-is-parsing)` links in articles 01 and 02
- A `what-is-rendering` article → add `[rendering](/articles/what-is-rendering)` links where the rendering pipeline is discussed

Don't overdo it — one or two natural inline links per related article is enough.

---

## Step 7 — Tell the user

Print a brief summary:

```
Done. Created:
  src/articles/<slug>.md
  public/articles/images/<slug>.png
  public/articles/images/<slug>.webp
  Updated src/data/articlesData.js
  [If applicable] Added cross-references in <files>

Run `npm run dev` to preview.
```
