import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ai = new GoogleGenAI({
  vertexai: true,
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

const MODEL = 'gemini-3-pro-image-preview';
const ARTICLES_DIR = path.join(__dirname, 'src/articles');
const IMAGES_DIR = path.join(__dirname, 'public/articles/images');
const DELAY_MS = 25000; // pause between requests to avoid rate limits

const STYLE_PROMPT = `
You are generating a premium editorial cover illustration for a developer-education article.

The artwork must feel like a luxury engineering publication:
sharp, elegant, architectural, modern, and highly intentional.

The image will appear on BOTH pure white (#ffffff) and pure black (#000000) website backgrounds.
Therefore the illustration itself must feel visually self-contained with its own premium framing system.

━━━━━━━━━━━━━━━━━━
FIXED TEMPLATE SYSTEM (CRITICAL)
━━━━━━━━━━━━━━━━━━

The outer frame/border and footer branding are part of a STRICT publishing template.

These elements must remain CONSISTENT across ALL generated images.

DO NOT redesign them.
DO NOT reinterpret them.
DO NOT vary their layout.

The following elements are FIXED:
1. Outer gold border
2. Corner border detailing
3. Footer branding placement
4. Footer typography
5. Footer spacing
6. Border thickness
7. Border color system

Every generated image must preserve the SAME:
- border geometry
- border spacing
- footer alignment
- footer sizing
- footer typography
- footer position

The article topic/content may change,
but the framing system must remain identical.

Treat the border/frame like a permanent magazine template.

━━━━━━━━━━━━━━━━━━
CORE VISUAL DIRECTION
━━━━━━━━━━━━━━━━━━

The design language should feel inspired by:
- Apple engineering presentations
- Linear design systems
- Stripe editorial diagrams
- premium Figma workflows
- elite frontend conference visuals
- high-end technical publications

The artwork should feel:
- precision-engineered
- editorial
- sophisticated
- restrained
- architectural
- expensive
- clean
- modern

NOT:
- cinematic
- cyberpunk
- futuristic
- glowing
- decorative
- flashy
- noisy
- game UI styled

━━━━━━━━━━━━━━━━━━
BACKGROUND
━━━━━━━━━━━━━━━━━━

Use ONE flat warm editorial-white background:

#f6f3eb

The background should feel:
- soft
- premium
- matte
- elegant
- minimal
- expensive

The background must remain visually quiet.

Avoid:
- gradients
- mesh backgrounds
- radial lighting
- glowing haze
- cinematic fog
- bloom
- abstract waves
- strong texture
- visible noise
- visual clutter

Optional:
- extremely subtle matte paper-like texture
- nearly invisible tonal variation

━━━━━━━━━━━━━━━━━━
BACKGROUND PARTICLES
━━━━━━━━━━━━━━━━━━

Add ONLY very subtle atmospheric richness:
- tiny dots/stars
- 1–2px
- very sparse
- 2–4% opacity
- warm gold or soft gray

The particles should be:
- elegant
- restrained
- barely noticeable

Avoid:
- glitter
- sparkles
- fantasy particles
- decorative effects

━━━━━━━━━━━━━━━━━━
FIXED OUTER BORDER
━━━━━━━━━━━━━━━━━━

Create ONE consistent editorial border system.

The border must:
- remain identical across all generated images
- NEVER change style
- NEVER change proportions
- NEVER move position

Border specifications:
- inset margin: 22px from canvas edges
- stroke thickness: exactly 2px
- color: #c8a95b
- opacity: 100%
- crisp sharp rendering
- no glow
- no blur
- no lighting variation

Corners:
- minimal geometric detailing
- symmetrical
- precise
- subtle
- consistent in every image

The border should feel:
- premium
- architectural
- editorial
- publication-grade

NOT decorative.

━━━━━━━━━━━━━━━━━━
FIXED FOOTER BRANDING
━━━━━━━━━━━━━━━━━━

Place this EXACT text:

naveenkarthik.com/articles

This footer branding is FIXED across ALL generated images.

Rules:
- NEVER move its position
- NEVER redesign its typography
- NEVER change its styling
- NEVER scale it differently
- NEVER reinterpret it artistically

Placement:
- exact bottom-center alignment
- positioned inside the border
- fixed spacing from bottom border

Typography:
- font size: 16px
- medium weight
- letter spacing: 0.08em
- clean geometric sans-serif
- color: #b68a1f

Appearance:
- subtle
- editorial
- premium
- restrained

The footer branding should feel like:
a luxury publication signature.

━━━━━━━━━━━━━━━━━━
TYPOGRAPHY
━━━━━━━━━━━━━━━━━━

DO NOT place:
- giant titles
- subtitles
- taglines
- marketing text
- decorative headings

ONLY include:
- one compact topic badge in the top-left

Topic badge styling:
- elegant rounded pill
- soft ivory surface
- subtle gold border
- restrained premium appearance

Badge colors:
- background: #fbf8f1
- border: #d8d1c2
- text: #1f1f1c

Typography:
- 14–15px
- medium/bold weight
- sharp and clean

Examples:
- "Browser Rendering"
- "Closures"
- "Async JavaScript"
- "React Reconciliation"

━━━━━━━━━━━━━━━━━━
EDITORIAL ABSTRACTION SYSTEM (CRITICAL)
━━━━━━━━━━━━━━━━━━

The illustration is NOT required to visualize every piece of information from the article.

The goal is:
- clarity first
- hierarchy first
- readability first
- editorial storytelling first

NOT maximum information density.

The image must behave like a premium editorial explainer,
NOT a fully compressed textbook page.

The system should intelligently:
- simplify
- compress
- abstract
- prioritize
- omit secondary details

when necessary.

If the article contains too much information,
DO NOT attempt to fit everything into a single image.

Instead:
- visualize only the most important concepts
- compress secondary concepts
- merge repetitive ideas
- reduce low-priority labels
- convert details into symbolic representation
- imply complexity instead of fully rendering it

The image should feel:
- intelligent
- distilled
- expertly curated
- editorially directed

NOT overcrowded.

━━━━━━━━━━━━━━━━━━
INFORMATION PRIORITIZATION
━━━━━━━━━━━━━━━━━━

The layout must prioritize information using strict hierarchy.

Priority order:

LEVEL 1 — PRIMARY CONCEPTS
- core pipeline
- key architectural relationships
- central technical insight
- most important transitions

These receive:
- largest visual emphasis
- highest readability
- strongest contrast
- most spacing

LEVEL 2 — SUPPORTING CONCEPTS
- secondary flows
- grouped subsystems
- supporting logic
- contextual relationships

These should be:
- simplified
- grouped
- visually compressed

LEVEL 3 — MICRO DETAILS
- edge cases
- implementation specifics
- excessive annotations
- low-value labels
- repetitive steps

These should:
- be minimized heavily
- be abstracted
- or removed entirely

DO NOT give equal visual weight to all information.

━━━━━━━━━━━━━━━━━━
READABILITY PROTECTION RULES
━━━━━━━━━━━━━━━━━━

Readability is MORE important than completeness.

NEVER allow:
- tiny unreadable text
- crowded labels
- overlapping connectors
- compressed panels
- dense microscopic annotations
- excessive diagram fragmentation

Minimum typography rules:
- absolute minimum text size: 16px
- preferred text size: 18–24px
- major labels: 24–36px

If content cannot fit at readable sizes:
REMOVE INFORMATION.

Do NOT scale typography down to force more content.

Whitespace is allowed.
Breathing room is premium.

━━━━━━━━━━━━━━━━━━
CONTENT BUDGET SYSTEM
━━━━━━━━━━━━━━━━━━

The image must obey a strict visual complexity budget.

Maximum recommended:
- 3–5 primary sections
- 6–10 major nodes
- 1 dominant flow direction
- 2 hierarchy levels maximum
- limited annotation density

Avoid:
- deeply nested systems
- giant multi-directional flow webs
- excessive branching
- over-annotated diagrams
- large quantities of small text

When article complexity increases:
SIMPLIFY the visualization.

Do NOT increase diagram density infinitely.

━━━━━━━━━━━━━━━━━━
ADAPTIVE SIMPLIFICATION
━━━━━━━━━━━━━━━━━━

When the article is highly technical:

DO:
- summarize visually
- compress repeated patterns
- represent systems symbolically
- merge related concepts
- show only the core mechanism
- imply sophistication through structure

DO NOT:
- illustrate every sentence
- map every paragraph
- render every implementation detail
- create textbook-level density

The illustration should communicate:
the essence of the topic,
not the entire article.

━━━━━━━━━━━━━━━━━━
EDITORIAL COMPOSITION
━━━━━━━━━━━━━━━━━━

The composition should feel like:
a curated magazine spread.

NOT:
a crowded technical whiteboard.

Use:
- strong focal points
- large readable sections
- deliberate empty space
- clean directional movement
- obvious hierarchy

The eye should immediately understand:
1. what the topic is
2. where to look first
3. how the system flows

Avoid chaotic scanning patterns.

━━━━━━━━━━━━━━━━━━
VISUAL RESTRAINT
━━━━━━━━━━━━━━━━━━

Sophistication comes from:
- restraint
- hierarchy
- spacing
- composition
- confidence

NOT from maximum detail.

The best images should feel:
- distilled
- intentional
- calm
- architectural
- readable at a glance

Even highly technical subjects must remain:
clean,
elegant,
and visually breathable.

━━━━━━━━━━━━━━━━━━
TEXT INSIDE DIAGRAM
━━━━━━━━━━━━━━━━━━

Text should be minimal and highly curated.

Prefer:
- short labels
- compressed terminology
- symbolic naming
- concise phrases

Avoid:
- paragraphs
- long explanations
- sentence-heavy panels
- excessive annotations

Every text element must justify its existence.

If a label is not essential:
remove it.

━━━━━━━━━━━━━━━━━━
COMPOSITION
━━━━━━━━━━━━━━━━━━

- aspect ratio: 16:9
- padding: 48–72px
- balanced spacing
- strong whitespace discipline
- centered composition
- strong focal hierarchy
- obvious visual flow
- premium editorial breathing room

The image should feel:
- curated
- architectural
- readable
- premium
- intelligently simplified

NOT overcrowded.

━━━━━━━━━━━━━━━━━━
FINAL QUALITY CHECK (MANDATORY)
━━━━━━━━━━━━━━━━━━

Before finalizing the image, verify:

- Is the image readable at normal viewing size?
- Is there clear hierarchy?
- Is there sufficient whitespace?
- Are major concepts instantly recognizable?
- Is typography comfortably readable?
- Does the image feel curated instead of overloaded?
- Would this still look premium as a website cover image?
- Could someone understand the core idea within 3 seconds?

If the answer is NO:
reduce complexity.

`;

const GEN_CONFIG = {
  maxOutputTokens: 32768,
  temperature: 1,
  topP: 0.95,
  responseModalities: ['TEXT', 'IMAGE'],
  imageConfig: {
    aspectRatio: '16:9',
    imageSize: '4K',
    outputMimeType: 'image/png',
  },
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH',      threshold: 'OFF' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'OFF' },
  ],
};

function collectArticles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'images') {
      results.push(...collectArticles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function imagePathFor(articlePath) {
  const base = path.basename(articlePath, '.md');
  return { imageDir: IMAGES_DIR, imagePath: path.join(IMAGES_DIR, `${base}.png`) };
}

async function generateImageFor(articlePath) {
  const content = fs.readFileSync(articlePath, 'utf-8');
  const prompt = `${STYLE_PROMPT}Article content:\n${content}\n\nGenerate a clear technical diagram or illustration that visually explains the main concept of the above article. Make it educational and self-contained. Follow the style rules above exactly.`;

  const chat = ai.chats.create({ model: MODEL, config: GEN_CONFIG });
  const response = await chat.sendMessageStream({ message: [{ text: prompt }] });

  for await (const chunk of response) {
    for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }
  }
  return null;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const countArg = process.argv.indexOf('--count');
  const limit = countArg !== -1 ? parseInt(process.argv[countArg + 1], 10) : Infinity;

  const articleArg = process.argv.indexOf('--article');
  const target = articleArg !== -1 ? process.argv[articleArg + 1] : null;

  let allArticles = collectArticles(ARTICLES_DIR);

  if (target) {
    // Accept article slug or filename (e.g. "02-critical-rendering-path" or "02-critical-rendering-path.md")
    const slug = target.replace(/\.md$/, '');
    allArticles = allArticles.filter(a => a.includes(slug));
    if (allArticles.length === 0) {
      console.error(`No article found matching: ${target}`);
      process.exit(1);
    }
  }

  const articles = allArticles.slice(0, limit);
  const total = articles.length;
  console.log(`Found ${total} articles\n`);

  let done = 0, skipped = 0, failed = 0;

  for (let i = 0; i < articles.length; i++) {
    const articlePath = articles[i];
    const rel = path.relative(ARTICLES_DIR, articlePath);
    const { imagePath } = imagePathFor(articlePath);

    process.stdout.write(`[${i + 1}/${total}] ${rel} ... `);

    if (fs.existsSync(imagePath)) {
      console.log('skip (exists)');
      skipped++;
      continue;
    }

    try {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });

      let imageBuffer = null;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        if (retries > 0) process.stdout.write(`retry ${retries}/${maxRetries} ... `);
        try {
          imageBuffer = await generateImageFor(articlePath);
          break;
        } catch (err) {
          retries++;
          if (retries >= maxRetries) {
            console.log(`ERROR: ${err.message}`);
          } else {
            await sleep(30000);
          }
        }
      }

      if (imageBuffer) {
        fs.writeFileSync(imagePath, imageBuffer);
        console.log(`saved → src/articles/images/${path.relative(IMAGES_DIR, imagePath)}`);
        done++;
      } else {
        console.log('WARNING: no image returned');
        failed++;
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failed++;
    }

    if (i < articles.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nDone. Generated: ${done} | Skipped: ${skipped} | Failed: ${failed}`);
}

main();
