Drag and drop makes interfaces feel native — reorder lists, upload files, move cards on a board. There are two approaches: the native HTML5 Drag and Drop API, and custom implementations using pointer events. This article covers both.

**Prerequisites:** [DOM Events #1 — Event Delegation & Bubbling](/articles/javascript-series/js-event-delegation-bubbling)

---

## 1. Native HTML5 Drag and Drop API

The native API uses `draggable="true"` and event handlers:

```js-exec
console.log("HTML5 Drag and Drop events:");
console.log("");
console.log("  On the DRAGGABLE element:");
console.log("    dragstart  — fires when dragging starts");
console.log("    drag       — fires continuously during drag");
console.log("    dragend    — fires when drag ends (success or cancel)");
console.log("");
console.log("  On the DROP ZONE:");
console.log("    dragenter  — dragged element enters the drop zone");
console.log("    dragover   — dragged element is over the drop zone (fires every ~100ms)");
console.log("    dragleave  — dragged element leaves the drop zone");
console.log("    drop       — element is dropped on the drop zone");

// Conceptual code:
// element.draggable = true;
// element.addEventListener("dragstart", (e) => {
//   e.dataTransfer.setData("text/plain", element.id);
//   e.dataTransfer.effectAllowed = "move";
// });
//
// dropZone.addEventListener("dragover", (e) => {
//   e.preventDefault(); // Required to allow drop!
// });
//
// dropZone.addEventListener("drop", (e) => {
//   e.preventDefault();
//   const id = e.dataTransfer.getData("text/plain");
//   const element = document.getElementById(id);
//   dropZone.appendChild(element);
// });
```

---

## 2. Custom Drag — Using mousedown/mousemove/mouseup

The native API is limited (no custom drag previews, inconsistent across browsers). A custom implementation gives full control:

```js-exec
function createCustomDrag(element, options = {}) {
  let isDragging = false;
  let startX, startY, initialX, initialY;

  element.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    // Store initial position (conceptual — needs actual CSS position)
    initialX = element.offsetLeft ?? 0;
    initialY = element.offsetTop ?? 0;

    element.style.cursor = "grabbing";
    console.log("Drag started at:", startX, startY);
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Move the element
    element.style.position = "relative";
    element.style.left = `${initialX + dx}px`;
    element.style.top = `${initialY + dy}px`;

    if (options.onDrag) {
      options.onDrag({ x: initialX + dx, y: initialY + dy, dx, dy });
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      console.log("Drag ended");
      element.style.cursor = "grab";
    }
    isDragging = false;
  });

  // Touch support
  element.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    isDragging = true;
    startX = touch.clientX;
    startY = touch.clientY;
    initialX = element.offsetLeft ?? 0;
    initialY = element.offsetTop ?? 0;
  }, { passive: false });

  document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    element.style.left = `${initialX + dx}px`;
    element.style.top = `${initialY + dy}px`;
  }, { passive: false });

  document.addEventListener("touchend", () => {
    isDragging = false;
  });

  return {
    destroy() {
      // Remove all listeners
      console.log("Drag destroyed — listeners removed");
    },
  };
}

console.log("Custom drag pattern:");
console.log("  1. mousedown: record start position, set flag");
console.log("  2. mousemove: calculate delta, update element position");
console.log("  3. mouseup: clear flag, finalize position");
console.log("  4. touch events: same pattern for mobile support");
```

---

## 3. Sortable List — Reorder Items with Drag and Drop

```js-exec
console.log("Sortable list algorithm:");
console.log("");
console.log("  mousedown on an item:");
console.log("    1. Record which item is being dragged");
console.log("    2. Create a visual clone / placeholder");
console.log("");
console.log("  mousemove:");
console.log("    1. Move the dragged item (or its clone) with the cursor");
console.log("    2. Calculate which slot it hovers over");
console.log("    3. Move the placeholder / reorder the array");
console.log("");
console.log("  mouseup:");
console.log("    1. Insert the item at the final position");
console.log("    2. Update the data model");
console.log("    3. Remove any clones / placeholders");

// Reorder algorithm:
// function reorder(list, startIndex, endIndex) {
//   const result = [...list];
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// }
```

---

## 4. File Drop Zone

```js-exec
function createFileDropZone(element) {
  // element.addEventListener("dragover", (e) => {
  //   e.preventDefault();
  //   element.classList.add("drag-over");
  // });
  //
  // element.addEventListener("dragleave", () => {
  //   element.classList.remove("drag-over");
  // });
  //
  // element.addEventListener("drop", (e) => {
  //   e.preventDefault();
  //   element.classList.remove("drag-over");
  //
  //   const files = Array.from(e.dataTransfer.files);
  //   console.log("Dropped files:", files.map((f) => f.name));
  //
  //   // Validate file types
  //   const validFiles = files.filter((f) =>
  //     f.type.startsWith("image/")
  //   );
  //
  //   // Read and preview
  //   for (const file of validFiles) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       console.log("File contents:", e.target.result.substring(0, 50) + "...");
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // });

  console.log("File drop zone pattern:");
  console.log("  - Highlight drop zone on dragover");
  console.log("  - e.dataTransfer.files gives FileList");
  console.log("  - FileReader reads contents for preview");
}

createFileDropZone();
```

---

## 5. Accessibility Considerations

```js-exec
console.log("Accessible drag and drop:");
console.log("");
console.log("  1. Provide keyboard alternatives:");
console.log("     - Arrow keys to select + Enter to pick up");
console.log("     - Arrow keys to move + Enter to drop");
console.log("");
console.log("  2. ARIA attributes:");
console.log("     - aria-grabbed on draggable items");
console.log("     - aria-dropeffect on drop zones");
console.log("     - Live regions to announce changes");
console.log("");
console.log("  3. Visual feedback:");
console.log("     - Focus indicators for keyboard users");
console.log("     - High-contrast drag previews");
console.log("     - Text announcements via aria-live");
```

---

## Key Takeaways

- **Native API**: `draggable="true"` + `dragstart`/`dragover`/`drop` events. Simple but limited.
- **Custom drag**: `mousedown`/`mousemove`/`mouseup` + touch events. Full control over appearance and behavior.
- **`e.preventDefault()`** is required on `dragover` to allow drops.
- **Mobile**: Use touch events (`touchstart`/`touchmove`/`touchend`) with `{ passive: false }`.
- For **sortable lists**: keep a data model, reorder on drop, re-render from the model.
- Always include **keyboard alternatives** for accessibility.

---

**Next:** [Web APIs #4 — `localStorage`, Cookies, `sessionStorage` & IndexedDB](/articles/javascript-series/js-storage-cookies-indexeddb) — all four browser storage APIs compared and implemented.
