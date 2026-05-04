# Performance #29 - Adaptive Loading — Network & Device-Aware Experiences

Performance optimization typically targets the average user on a decent connection. But a significant portion of web traffic comes from low-end Android devices on 3G networks, where "fast on my MacBook" can mean "unusable in practice". Adaptive loading adjusts what you serve based on the actual capabilities of the user's device and network — not assumptions about them.

---

## The Network Information API

`navigator.connection` exposes the user's network conditions. The three signals you'll use most often:

```js
const conn = navigator.connection;

// effectiveType is the most practical signal — derived from observed RTT/downlink,
// not the network label. A weak 4G connection may report '2g' if throughput is poor.
console.log(conn.effectiveType); // '4g', '3g', '2g', 'slow-2g'
console.log(conn.downlink);      // estimated bandwidth in Mbps
console.log(conn.rtt);           // estimated round-trip time in ms

// saveData is explicit user intent. Always respect it — don't load heavy assets
// regardless of what effectiveType says.
console.log(conn.saveData);      // true if user enabled Data Saver
```

You can also listen for changes — a user might move from WiFi to cellular mid-session:

```js
navigator.connection?.addEventListener('change', () => {
  console.log('Network changed:', navigator.connection.effectiveType);
  updateMediaQuality();
});
```

---

## The Device Memory API

```js
// Returns 0.25, 0.5, 1, 2, 4, or 8 (GB, deliberately coarsened for privacy)
console.log(navigator.deviceMemory);
```

Values below 1GB indicate a low-memory device — and low-memory devices are almost always low-CPU too. A device with 512MB of RAM will struggle with a 2MB JavaScript bundle, heavy animations, and multiple concurrent web workers.

---

## Hardware Concurrency

```js
// Number of logical CPU cores available
console.log(navigator.hardwareConcurrency); // e.g. 4, 8, 16
```

Low core counts (1–2) indicate constrained CPUs. Avoid spawning many Web Workers on these devices — overhead exceeds benefit.

---

## Practical Adaptive Loading Patterns

Here's a reusable helper that consolidates the connection signals into a single object:

```js
function getDeviceCapabilities() {
  const conn = navigator.connection;
  return {
    isSlowNetwork: conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g',
    saveData: conn?.saveData ?? false,
    isLowMemory: (navigator.deviceMemory ?? 4) < 1,
    cpuCores: navigator.hardwareConcurrency ?? 2,
  };
}
```

### Serve lower-quality images on slow connections

```js
function getImageSrc(base) {
  const { isSlowNetwork, saveData } = getDeviceCapabilities();

  if (saveData || isSlowNetwork) {
    return `${base}-low.webp`; // ~20KB instead of ~200KB
  }
  return `${base}.webp`;
}
```

### Disable non-essential animations on Save Data or slow networks

```js
const { saveData, isSlowNetwork } = getDeviceCapabilities();

// Decorative particle effects aren't worth burning data on
if (!saveData && !isSlowNetwork) {
  startParticleAnimation();
}
```

### Defer non-critical JS on low-end devices

```js
const { isLowMemory } = getDeviceCapabilities();

// Only load the heavy feature module on devices that can handle it
if (!isLowMemory) {
  import('./heavy-feature.js').then((module) => module.init());
}
```

### Reduce worker count based on CPU

```js
// Cap at 4 workers — more than that rarely helps and adds scheduling overhead
const workerCount = Math.min(navigator.hardwareConcurrency ?? 2, 4);
const pool = Array.from({ length: workerCount }, () => new Worker('/worker.js'));
```

---

## CSS Media Query: prefers-reduced-data

The `prefers-reduced-data` media query (in progress, limited support) mirrors `saveData` for CSS:

```css
@media (prefers-reduced-data: reduce) {
  .hero-video { display: none; }
  .hero-image { display: block; }
}
```

Until browser support broadens, check `navigator.connection.saveData` in JavaScript and add a class to `<html>` to drive CSS variations:

```js
if (navigator.connection?.saveData) {
  document.documentElement.classList.add('save-data');
}
```

```css
.save-data .hero-video { display: none; }
.save-data .hero-image { display: block; }
```

---

## prefers-reduced-motion

This is widely supported and critical for accessibility:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Some users disable motion for vestibular disorders, not just device constraints. Always respect this preference.

---

## React Adaptive Hooks

The `@react-hookz/web` and similar libraries expose `useNetworkState()` and `useDeviceMemory()` hooks:

```jsx
import { useNetworkState } from '@react-hookz/web';

function AdaptiveVideo({ src, posterSrc }) {
  const network = useNetworkState();
  // Re-renders automatically when the connection type changes
  const isSlowConnection = network.effectiveType === '2g' || network.saveData;

  if (isSlowConnection) {
    // Show a static thumbnail instead of autoloading a video
    return <img src={posterSrc} alt="Video thumbnail" />;
  }

  return <video src={src} controls />;
}
```

---

## What Adaptive Loading Is Not

Adaptive loading is not a substitute for core performance work. A 5MB JS bundle is slow for everyone — serving 4.5MB to low-end devices doesn't fix the problem. Apply adaptive loading on top of a baseline that's already fast, to extend that fastness to the most constrained users.

It also shouldn't gate features in a way that creates a degraded "poor person's version" of the app. The goal is graceful adaptation — same features, less expensive delivery — not feature removal.

`saveData` is the one signal worth prioritising above all others — it's explicit user intent, not an inference. If someone has turned on Data Saver, that's a direct instruction. Everything else is a heuristic.
