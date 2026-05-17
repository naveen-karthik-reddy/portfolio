The DOM (Document Object Model) is the browser's in-memory tree of an HTML page. For interviews, you need to know how to find elements, read their properties, traverse the tree, and understand the difference between inline styles and computed styles.

---

## 1. Finding Elements

```js-exec
// By CSS selector — returns first match
const header = document.querySelector('h1');

// By CSS selector — returns all matches (NodeList, not array)
const allLinks = document.querySelectorAll('a');

// By ID
const main = document.getElementById('main');

// By class name — returns live HTMLCollection
const cards = document.getElementsByClassName('card');

// By tag name — returns live HTMLCollection
const paragraphs = document.getElementsByTagName('p');
```

**`querySelector` vs `getElementBy*`**: The `querySelector` methods return static `NodeList`s. The `getElementBy*` methods return live `HTMLCollection`s — they update automatically when the DOM changes.

---

## 2. Element Properties

```js-exec
const el = document.querySelector('div');

// Tag name (always uppercase in HTML documents)
el.tagName;          // 'DIV'

// ID
el.id;               // 'my-div' or ''

// CSS classes
el.className;        // string of all classes
el.classList;        // DOMTokenList — use this!

// Content
el.textContent;      // all text, ignoring HTML tags
el.innerHTML;        // raw HTML
el.innerText;        // rendered text (considers CSS visibility)
```

---

## 3. `classList` API

```js-exec
const el = document.querySelector('div');
el.classList.add('active', 'highlight');
el.classList.remove('inactive');
el.classList.toggle('visible');
el.classList.contains('active');  // true/false
el.classList.replace('old', 'new');
```

**Interview use**: `getElementsByClassName` (#24) checks `element.classList.contains(className)` to match descendants.

---

## 4. Attributes

```js-exec
const el = document.querySelector('input');

// Get/set any attribute
el.getAttribute('type');           // 'text'
el.setAttribute('disabled', '');   // sets disabled
el.removeAttribute('disabled');

// For data-* attributes
el.dataset.id;     // <div data-id="5">  →  '5'
el.dataset.userName;  // <div data-user-name="alice">  →  'alice'
```

---

## 5. Traversing the Tree

```js-exec
const el = document.querySelector('.parent');

// Children — only element nodes
el.children;          // HTMLCollection of child elements
el.children[0];       // first child element
el.childElementCount; // number of child elements

// Parent
el.parentElement;     // parent element (or null)
el.parentNode;        // parent node (could be document fragment)

// Siblings
el.previousElementSibling;  // previous element sibling
el.nextElementSibling;      // next element sibling

// First/Last element child
el.firstElementChild;
el.lastElementChild;
```

**Important**: `children` returns only **element** nodes. `childNodes` returns ALL nodes (text nodes, comments, etc.). Always use `children` for tree traversal — it's what the native DOM methods traverse.

**Interview use**: DFS walk in `getElementsByClassName` (#24) — iterate `element.children`.

---

## 6. Creating, Inserting, and Removing Elements

```js-exec
// Create
const div = document.createElement('div');
div.textContent = 'Hello';
div.className = 'greeting';

// Insert
parent.appendChild(div);                    // append as last child
parent.insertBefore(div, parent.children[0]); // insert before specific child
parent.prepend(div);                        // prepend (modern)
parent.append(div);                         // append (modern)
sibling.before(div);                        // insert before sibling
sibling.after(div);                         // insert after sibling

// Remove
div.remove();              // remove self
parent.removeChild(div);   // remove child
```

---

## 7. Styles

### Inline Styles (element.style)

```js-exec
const el = document.querySelector('div');
el.style.backgroundColor = 'red';
el.style.fontSize = '16px';
// Reads/writes ONLY inline style — not CSS from stylesheets
```

### Computed Styles (getComputedStyle)

```js-exec
const el = document.querySelector('div');
const styles = getComputedStyle(el);
console.log(styles.backgroundColor);  // actual computed value
console.log(styles.fontSize);         // actual computed value
console.log(styles.display);          // actual computed value
```

**Key difference**: `element.style` only reads inline styles. `getComputedStyle(element)` reads the final applied style after all CSS rules and inheritance are resolved.

**Interview use**: `getElementsByStyle` (#24) — use `getComputedStyle` to check the actual rendered style.

---

## 8. Events

```js-exec
const el = document.querySelector('button');

// Listen
el.addEventListener('click', (event) => {
  console.log('Clicked at', event.clientX, event.clientY);
});

// Remove (must have the same function reference)
function handler(e) { console.log('click'); }
el.addEventListener('click', handler);
el.removeEventListener('click', handler);
```

---

## 9. Data Storage on Elements

```js-exec
const el = document.querySelector('div');
el.dataset.userId = '42';     // sets data-user-id="42"
console.log(el.dataset.userId); // '42'
```

---

## Quick Reference

| Task | Method/Property |
|-|-|
| Find first | `querySelector(css)` |
| Find all | `querySelectorAll(css)` |
| Tag name | `element.tagName` (UPPERCASE in HTML) |
| Class check | `element.classList.contains(cls)` |
| Child elements | `element.children` (elements only) |
| Parent | `element.parentElement` |
| Inline style | `element.style.property` |
| Computed style | `getComputedStyle(element).property` |
| Create | `document.createElement(tag)` |
| Append | `parent.appendChild(el)` or `parent.append(el)` |
| Remove | `el.remove()` |

---

## Interview Tips

- **Use `element.children`, not `childNodes`** — `childNodes` includes text nodes and comments.
- **Tag names are UPPERCASE in HTML** — `element.tagName` returns `'DIV'`, not `'div'`. Use `.toUpperCase()` for case-insensitive comparison.
- **`getComputedStyle`, not `element.style`** — the interviewer wants to see you know the difference.
- **DFS over `children` preserves document order** — the native DOM methods return elements in document order, which is DFS pre-order.

---

## Related Articles

- [#24 — DOM Traversal](/articles/js-interview-dom-traversal)
- [DOM Events #1 — Event Delegation & Bubbling](/articles/js-event-delegation-bubbling)
