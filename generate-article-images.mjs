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
DIAGRAM LAYOUT
━━━━━━━━━━━━━━━━━━

The diagram is the hero.

It should:
- occupy ~85–90% of the canvas
- feel information-dense
- remain highly readable
- feel balanced and architectural

Use:
- multi-step flows
- layered systems
- grouped sections
- directional relationships
- structured pipelines
- hierarchy visualization
- nested blocks
- organized information density

The image should instantly communicate:
"This explains something technically sophisticated."

━━━━━━━━━━━━━━━━━━
PANELS & SURFACES
━━━━━━━━━━━━━━━━━━

Panels should feel:
- architectural
- engineered
- editorial
- premium
- structured

Use layered surfaces:
- warm ivory
- soft stone
- restrained charcoal
- muted gold accents

Panel fills may include:
- #fbf8f1
- #ece7da
- #26231d

Borders:
- thin and precise
- warm gray or muted gold
- restrained contrast
- crisp edge definition

Depth:
- subtle anchored shadows
- matte surfaces
- controlled material separation

Avoid:
- glow
- bloom
- glassmorphism
- blurry haze
- neon edges
- floating light effects

━━━━━━━━━━━━━━━━━━
CONNECTORS & FLOW
━━━━━━━━━━━━━━━━━━

Connectors should feel:
- engineered
- precise
- clean
- restrained

Primary flows:
- muted gold
- charcoal

Secondary flows:
- warm gray
- softer contrast

Arrows:
- sharp
- architectural
- intentional

Avoid:
- glowing connectors
- sci-fi energy lines
- visual clutter

━━━━━━━━━━━━━━━━━━
TEXT INSIDE DIAGRAM
━━━━━━━━━━━━━━━━━━

Typography should feel:
- editorial
- compact
- precise
- premium

Use:
- Rich Charcoal        #1f1f1c
- Warm Slate           #4b4b45
- Muted Gold           #c59b2d
- Soft Ivory           #fbf8f1

Reserve stronger contrast ONLY for:
- critical labels
- important transitions
- primary flow emphasis

Typography styling:
- 13–16px
- medium or bold
- crisp
- sharp
- highly readable

Avoid:
- oversized typography
- decorative fonts
- low-contrast text
- thin lightweight text

━━━━━━━━━━━━━━━━━━
COLOR SYSTEM
━━━━━━━━━━━━━━━━━━

BACKGROUND
- Warm Editorial White   #f6f3eb

PRIMARY TEXT
- Rich Charcoal          #1f1f1c

SECONDARY TEXT
- Warm Slate             #4b4b45

SURFACES
- Soft Ivory             #fbf8f1
- Warm Stone             #ece7da
- Deep Charcoal          #26231d

BORDERS & ACCENTS
- Soft Gold              #c8a95b
- Muted Gold             #c59b2d
- Deep Bronze            #7a5a12

STATUS COLORS
- Emerald                #059669
- Crimson                #be123c

Rules:
- maintain restrained elegance
- avoid rainbow palettes
- avoid neon saturation
- avoid visual noise
- avoid overusing gold

━━━━━━━━━━━━━━━━━━
LIGHTING DISCIPLINE
━━━━━━━━━━━━━━━━━━

Lighting must remain highly restrained.

Use:
- crisp edge definition
- subtle hierarchy
- localized emphasis only
- matte material rendering

Avoid:
- bloom
- cinematic glow
- haze
- fog
- dreamy lighting
- atmospheric diffusion

Dark surfaces should remain confidently dark.
Bright accents should feel intentional.

━━━━━━━━━━━━━━━━━━
LAYOUT CONSISTENCY
━━━━━━━━━━━━━━━━━━

The image should behave like a reusable editorial cover template.

ONLY the central diagram/content changes.

The following must remain visually stable across all generations:
- border system
- footer branding
- corner detailing
- outer spacing
- overall framing composition
- typography hierarchy
- badge positioning

Maintain strong template consistency.

━━━━━━━━━━━━━━━━━━
COMPOSITION
━━━━━━━━━━━━━━━━━━

- aspect ratio: 16:9
- padding: 40–56px
- balanced spacing
- minimal wasted space
- centered composition
- strong hierarchy

The final artwork should feel:
- expensive
- precise
- editorial
- engineered
- modern
- highly intentional

━━━━━━━━━━━━━━━━━━
STRICTLY AVOID
━━━━━━━━━━━━━━━━━━

- giant titles
- oversized typography
- cyberpunk aesthetics
- neon colors
- excessive glow
- fantasy styling
- decorative glitter
- stock illustration feel
- comic styling
- random floating objects
- giant empty areas
- blurry rendering
- generic AI infographic aesthetics
- equal emphasis everywhere
- noisy composition

━━━━━━━━━━━━━━━━━━
FINAL ART DIRECTION
━━━━━━━━━━━━━━━━━━

The image should feel expensive BEFORE it feels informative.

Prioritize:
- editorial precision
- material contrast
- sharp hierarchy
- restrained sophistication
- architectural composition
- premium readability

The final result should feel like:
"A luxury editorial systems visualization crafted for elite developer education."
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
