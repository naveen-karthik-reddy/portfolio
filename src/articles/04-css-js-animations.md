Animations are where performance becomes viscerally obvious. A janky scroll or a stuttering modal open is immediately noticed. Whether you write your animations in CSS or JavaScript determines which rendering pipeline steps they trigger — and whether they can run at 60fps without touching the main thread at all.

---

## The Rendering Cost of Animations

Every animation that changes layout geometry — `width`, `height`, `top`, `left`, `margin`, `padding` — forces the browser through the full pipeline: layout → paint → composite. At 60fps, you have 16.67ms per frame. Layout alone can consume most of that budget.

The goal is to animate only properties that skip layout and paint entirely.

---

## Compositor-Only Properties

Two CSS properties are handled entirely by the compositor thread, bypassing the main thread (see [compositing layers](/articles/what-are-compositing-layers)):

- **`transform`** — covers translation (`translateX`, `translateY`), scale, rotate, and skew
- **`opacity`** — fades elements in and out

Because compositing runs on its own thread, these animations remain smooth even when JavaScript is blocking the main thread with heavy work. This is the most important rule in animation performance.

```css
/* ❌ Expensive — triggers layout on every frame */
.bad {
  transition: left 300ms ease;
}

/* ✅ Free — compositor only, skips layout and paint */
.good {
  transition: transform 300ms ease;
}
```

The practical translation: if you're moving an element, use `transform: translateX()` instead of changing `left`. If you're showing/hiding, use `opacity` instead of toggling `display` mid-transition.

---

## CSS Transitions vs CSS Animations vs JS Animations

**CSS Transitions** are the simplest tool. Triggered by a class change or pseudo-state, they interpolate between two property values over a duration.

**CSS Animations** (`@keyframes`) give you multi-step control with timing functions per step. Both run on the compositor for `transform` and `opacity`.

**JavaScript animations** (via `requestAnimationFrame` or libraries like GSAP) run on the main thread. They are more flexible — you can respond to physics, user input mid-animation, or drive complex sequences — but they compete with JS execution for main-thread time.

Use CSS for simple state transitions. Use JS (or GSAP) when you need choreography, interruptibility, or physics.

```css
/* ✅ CSS transition — clean, compositor-handled */
.modal {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 200ms ease, transform 200ms ease;
}
.modal.open {
  opacity: 1;
  transform: translateY(0);
}
```

```js
// ✅ JS animation — fine for physics-based or interruptible motion
function springAnimate(timestamp) {
  velocity += (target - position) * stiffness;
  velocity *= damping;
  position += velocity;
  element.style.transform = `translateX(${position}px)`;
  if (Math.abs(velocity) > 0.01) requestAnimationFrame(springAnimate);
}
requestAnimationFrame(springAnimate);
```

---

## requestAnimationFrame

When you need JS-driven animation, `requestAnimationFrame` (rAF) is the correct tool. The browser calls your callback exactly once per frame, before paint, synchronized to the display refresh rate.

```js
function animate(timestamp) {
  element.style.transform = `translateX(${position}px)`;
  position += speed;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

Never use `setInterval` or `setTimeout` for animation. They fire on their own schedule, not the browser's frame budget, causing tearing and dropped frames.

---

## The `will-change` Property

`will-change` hints to the browser that an element is about to be animated, allowing it to promote the element to its own compositor layer in advance.

```css
.card {
  will-change: transform;
}
```

This avoids a janky first frame where the browser scrambles to create the layer mid-animation. However, each promoted layer consumes GPU memory. Apply `will-change` only to elements that will actually animate, and remove it after the animation completes.

```js
element.style.willChange = 'transform';
startAnimation();
element.addEventListener('transitionend', () => {
  element.style.willChange = 'auto';
});
```

Blanket `will-change: transform` on every element is an anti-pattern that increases memory pressure without benefit.

---

## Detecting Jank

Chrome DevTools' Performance panel shows frames as green bars along the timeline. Red bars or gaps are dropped frames. The Rendering tab's FPS meter shows live frame rate.

The **Layers panel** (DevTools → More Tools → Layers) shows every promoted compositor layer and its memory cost — useful for auditing `will-change` overuse.

---

The two-sentence version of all of this: animate `transform` and `opacity`, not geometry. When you need JS control, use `requestAnimationFrame`. Everything else — `will-change`, CSS vs JS choice, compositor layer auditing — is refinement on top of those two rules.
