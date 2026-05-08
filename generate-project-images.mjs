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
const OUTPUT_DIR = path.join(__dirname, 'public/projects');
const DELAY_MS = 5000;

const GEN_CONFIG = {
  maxOutputTokens: 32768,
  temperature: 1,
  topP: 0.95,
  responseModalities: ['TEXT', 'IMAGE'],
  imageConfig: {
    aspectRatio: '16:9',
    imageSize: '1K',
    outputMimeType: 'image/png',
  },
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH',      threshold: 'OFF' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'OFF' },
  ],
};

const PROJECTS = [
  {
    id: 'holdings-analyzer',
    name: 'Holdings Analyzer',
    description: `A Zerodha portfolio dashboard built with React. Upload a holdings CSV and get:
- Portfolio allocation breakdown with pie/donut charts
- Top gainers & losers tables
- Full sortable, editable holdings table with real-time P&L
- Six analysis tabs: Overview, Holdings, Dividends, Fundamentals, Risk, Analyst
- Color-coded risk thresholds, 52-week range progress bars
- Four compounding calculators (SIP, Lumpsum, Goal, CAGR) with Recharts stacked-area charts`,
    prompt: `Generate a bold, minimal hero illustration for a financial portfolio dashboard project. This will be displayed as a small card thumbnail (200px tall) — so keep everything large, clean, and readable at tiny sizes.

Requirements:
- Dark background (#0f172a to #1e293b gradient)
- Large, bold bar chart made of 6 rectangular bars in shades of blue (#2196f3, #38bdf8, #60a5fa) — these should be the main focal point, occupying most of the canvas
- A single smooth pink trend line (#f472b6) arching across the chart with 6 visible data dots
- Very subtle horizontal grid lines in the background
- NO text, NO labels, NO numbers, NO badges, NO UI chrome
- Clean, minimal, modern — like a Stripe-style abstract data visualization
- Large geometric shapes only — this must look good at 200px height`,
  },
  {
    id: 'web-performance-planner',
    name: 'Web Performance Planner',
    description: `A what-if simulator for web performance. Tweak resources and instantly see estimated Lighthouse scores. Features:
- Import real Lighthouse JSON reports for calibrated predictions
- Score all five Core Web Vitals (FCP, LCP, TBT, CLS, SI)
- Interactive Chrome DevTools-style network waterfall with zoom/pan
- Resource panel for adding/editing scripts, stylesheets, images, fonts
- Comparison mode: up to 4 variations side-by-side with best/worst highlighting
- Optimization roadmap ranked by score gain`,
    prompt: `Generate a bold, minimal hero illustration for a web performance analysis tool. This will be displayed as a small card thumbnail (200px tall) — so keep everything large, clean, and readable at tiny sizes.

Requirements:
- Dark background (#1a1110 to #1f1a14 gradient)
- A large, prominent semi-circular gauge on the left side — thick orange arc (#ff9800, #f97316) against a dark track, with a bold "85" as the only number on the canvas
- On the right side, 6-7 horizontal waterfall bars (no labels) in warm amber/orange/yellow tones (#fbbf24, #f59e0b, #fb923c, #ea580c) — each bar made of 2-3 colored segments showing different phases
- A small "LCP" marker line pointing to the longest bar
- Very subtle background grid dots
- NO small text, NO metric labels, NO UI chrome, NO cards, NO navigation
- Large geometric shapes only — this must look good at 200px height`,
  },
];

async function generateImage(prompt) {
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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Generating ${PROJECTS.length} project images...\n`);

  for (let i = 0; i < PROJECTS.length; i++) {
    const proj = PROJECTS[i];
    const outPath = path.join(OUTPUT_DIR, `${proj.id}.png`);

    process.stdout.write(`[${i + 1}/${PROJECTS.length}] ${proj.name} ... `);

    if (fs.existsSync(outPath)) {
      console.log('skip (exists)');
      continue;
    }

    try {
      const buffer = await generateImage(proj.prompt);
      if (buffer) {
        fs.writeFileSync(outPath, buffer);
        console.log(`saved → public/projects/${proj.id}.png`);
      } else {
        console.log('WARNING: no image returned');
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }

    if (i < PROJECTS.length - 1) await sleep(DELAY_MS);
  }

  console.log('\nDone.');
}

main();
