DOM events flow through three phases — capture, target, bubble — before they reach their destination. Event delegation leverages this to handle hundreds of child elements with a single listener on the parent. This article covers the full event flow and the delegation pattern.

---

## 1. The Three Phases — Capture, Target, Bubble

When you click a nested element, the event travels down (capture), reaches the target, then travels back up (bubble):

```js-exec
// Simulating the DOM event flow:
// <div id="parent">
//   <button id="child">Click me</button>
// </div>

console.log("Event flow when clicking the button:");
console.log("");
console.log("  Phase 1: CAPTURE (downward)");
console.log("    document → html → body → #parent → #child");
console.log("");
console.log("  Phase 2: TARGET");
console.log("    Event reaches #child — target phase");
console.log("");
console.log("  Phase 3: BUBBLE (upward)");
console.log("    #child → #parent → body → html → document");

// By default, addEventListener listens in the bubble phase.
// Pass { capture: true } or true as 3rd arg for capture phase.
```

---

## 2. `stopPropagation` vs `stopImmediatePropagation`

```js-exec
// Simulated event handlers showing the differences
console.log("stopPropagation() = stop bubbling, but other handlers on");
console.log("    the SAME element still fire for the same event");
console.log("");
console.log("stopImmediatePropagation() = stop everything —");
console.log("    no more handlers on this element OR any ancestors");

// Example:
// element.addEventListener("click", handler1);  // fires
// element.addEventListener("click", (e) => {
//   e.stopImmediatePropagation();              // stops handler3 + all ancestors
// });
// element.addEventListener("click", handler3);  // SKIPPED
// parent.addEventListener("click", parentHandler); // SKIPPED
```

---

## 3. The Problem Without Delegation — N Listeners for N Elements

Attaching individual listeners to every item doesn't scale:

```js-exec
// ❌ Without delegation — 1000 items = 1000 listeners (memory + setup cost)
function setupWithoutDelegation(items) {
  // for (const item of items) {
  //   item.addEventListener("click", () => handleClick(item));
  // }
  console.log(`Without delegation: ${items} items → ${items} listeners`);
}

// ✅ With delegation — ANY number of items = 1 listener
function setupWithDelegation(container) {
  // container.addEventListener("click", (e) => {
  //   const item = e.target.closest(".item");
  //   if (item) handleClick(item);
  // });
  console.log("With delegation: 1 listener for any number of items");
}

setupWithoutDelegation(1000);
setupWithDelegation();
```

---

## 4. Event Delegation — The Pattern

Attach ONE listener to a parent. Use `event.target` to determine which child was clicked:

```js-exec
// Real delegation pattern (conceptual — needs DOM):
function initDelegation() {
  // const list = document.getElementById("todo-list");
  //
  // list.addEventListener("click", (event) => {
  //   // Use closest() to find the nearest matching ancestor
  //   const deleteBtn = event.target.closest(".delete-btn");
  //   const editBtn = event.target.closest(".edit-btn");
  //   const checkbox = event.target.closest("input[type='checkbox']");
  //
  //   const item = event.target.closest(".todo-item");
  //   const id = item?.dataset.id;
  //
  //   if (deleteBtn) {
  //     deleteTodo(id);
  //   } else if (editBtn) {
  //     editTodo(id);
  //   } else if (checkbox) {
  //     toggleTodo(id);
  //   }
  // });

  console.log("Delegation pattern:");
  console.log("  1. One listener on the container");
  console.log("  2. event.target = the actual element clicked");
  console.log("  3. .closest(selector) = find which logical button was clicked");
  console.log("  4. data-* attributes carry the ID");
}

initDelegation();
```

---

## 5. `matches()` and `closest()` — The Two Key Methods

```js-exec
// matches(selector) → does this element match?
// closest(selector) → nearest ancestor (including self) that matches

// Simulated:
const element = { tagName: "BUTTON", className: "delete-btn primary" };

function simulateMatches(el, selector) {
  // el.matches(".delete-btn") → true
  // el.matches(".edit-btn") → false
  console.log(`matches("${selector}"):`, selector === ".delete-btn");
}

function simulateClosest(target, selector) {
  // Walk up the tree: target → parent → grandparent → ...
  // Return first match or null
  console.log(`closest("${selector}"):`, "returns nearest ancestor matching the selector");
}

simulateMatches(element, ".delete-btn");
simulateClosest(element, ".todo-item");
```

---

## 6. Event Delegation with Dynamic Content

Delegation handles elements added AFTER the listener was created — no re-binding needed:

```js-exec
function demonstrateDynamicDelegation() {
  // const container = document.getElementById("list");
  //
  // // Set up delegation once
  // container.addEventListener("click", (e) => {
  //   const item = e.target.closest(".item");
  //   if (item) console.log("Clicked:", item.textContent);
  // });
  //
  // // Add items dynamically — no new listeners needed!
  // container.insertAdjacentHTML("beforeend", '<div class="item">New item</div>');

  console.log("Dynamic content benefit:");
  console.log("  - Add/remove items at any time");
  console.log("  - Delegated listener handles them automatically");
  console.log("  - No addEventListener on each new element");
}

demonstrateDynamicDelegation();
```

---

## 7. Event Propagation Diagram

```js-exec
console.log("┌──────────────────────────────────────────────────┐");
console.log("│            DO CUMENT                             │");
console.log("│  ┌────────────────────────────────────────────┐  │");
console.log("│  │              BO DY                          │  │");
console.log("│  │  ┌──────────────────────────────────────┐  │  │");
console.log("│  │  │            PAR ENT                     │  │  │");
console.log("│  │  │  ┌────────────────────────────────┐  │  │  │");
console.log("│  │  │  │          BUTT ON (target)        │  │  │  │");
console.log("│  │  │  └────────────────────────────────┘  │  │  │");
console.log("│  │  └──────────────────────────────────────┘  │  │");
console.log("│  └────────────────────────────────────────────┘  │");
console.log("└──────────────────────────────────────────────────┘");
console.log("");
console.log("Capturing: ↓ document → body → parent → button");
console.log("Bubbling:  ↑ button → parent → body → document");
```

---

## Key Takeaways

- Events flow: **capture** (down) → **target** → **bubble** (up). Listeners default to bubble phase.
- **Event delegation**: one listener on a parent handles all children via `event.target`.
- Use **`event.target.closest(selector)`** to find the nearest matching element from the click target.
- Delegation works with **dynamically added elements** — no re-binding needed.
- **`stopPropagation()`** stops the event traveling further up/down (but same-element handlers still fire).
- **`stopImmediatePropagation()`** stops everything on the current element + ancestors.

---

**Next:** [DOM Events #2 — Drag & Drop](/articles/javascript-series/js-drag-and-drop) — native drag and drop API and custom implementations.
