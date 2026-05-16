Ten snippets. For each one, predict what gets logged before you expand the answer. The rules being tested — `var` hoisting, function hoisting, the Temporal Dead Zone, and block scope — come up in almost every JS interview. Get these right and you'll never be surprised by them again.

---

## Q1 — var declaration before assignment

```js-exec
console.log(x);
var x = 5;
console.log(x);
```

<details>
<summary>Show answer</summary>

**Output:**
```
undefined
5
```

**Why:** `var` declarations are hoisted to the top of their function (or global) scope, but only the *declaration* is hoisted — not the assignment. The engine treats this as `var x; console.log(x); x = 5;`. The first log prints `undefined` because `x` exists but has not been assigned yet. The second log prints `5` after the assignment runs.

</details>

---

## Q2 — Function declaration vs var

```js-exec
console.log(typeof greet);
console.log(typeof x);

var x = 10;
function greet() { return "hello"; }
```

<details>
<summary>Show answer</summary>

**Output:**
```
function
undefined
```

**Why:** Function *declarations* are hoisted entirely — both the name and the body. So `greet` is already a fully usable function before the first `console.log`. `var x` is hoisted as a declaration only, so `typeof x` is `"undefined"` (not a ReferenceError) before the assignment runs.

</details>

---

## Q3 — let in the Temporal Dead Zone

```js-exec
try {
  console.log(a);
  let a = 1;
} catch (e) {
  console.log(e.constructor.name);
}
```

<details>
<summary>Show answer</summary>

**Output:**
```
ReferenceError
```

**Why:** `let` (and `const`) are also "hoisted" in the sense that the engine knows the variable exists in the block, but they are placed in the **Temporal Dead Zone** from the start of the block until the declaration line. Any access before the declaration throws a `ReferenceError`. This is intentional — it prevents the confusing `undefined` behavior of `var`.

</details>

---

## Q4 — var leaks out of blocks

```js-exec
if (true) {
  var blockVar = "I leaked";
  let blockLet = "I'm contained";
}

console.log(typeof blockVar);
console.log(typeof blockLet);
```

<details>
<summary>Show answer</summary>

**Output:**
```
string
undefined
```

**Why:** `var` is function-scoped (or global-scoped), not block-scoped. The `if` block is not a function boundary, so `blockVar` escapes into the outer scope. `let` is block-scoped — it ceases to exist outside the `{}` where it was declared, so `typeof blockLet` returns `"undefined"` (no ReferenceError because `typeof` is safe on undeclared variables).

</details>

---

## Q5 — Function declaration wins over var

```js-exec
var foo = 1;

function foo() {
  return 2;
}

console.log(typeof foo);
console.log(foo);
```

<details>
<summary>Show answer</summary>

**Output:**
```
number
1
```

**Why:** During hoisting, the function declaration is processed first, making `foo` a function. Then the `var foo = 1` assignment runs at runtime and overwrites it with `1`. The `typeof` check and log both happen after the assignment, so `foo` is `1`. If you removed the `var foo = 1` line, `foo` would log `[Function: foo]`.

</details>

---

## Q6 — var inside a for loop

```js-exec
for (var i = 0; i < 3; i++) {}
console.log(i);

for (let j = 0; j < 3; j++) {}
console.log(typeof j);
```

<details>
<summary>Show answer</summary>

**Output:**
```
3
undefined
```

**Why:** `var i` is function-scoped, so it leaks out of the `for` loop. After the loop `i` is `3` (the value that failed the `i < 3` check). `let j` is block-scoped to the `for` statement — it doesn't exist outside the loop, so `typeof j` is `"undefined"`.

</details>

---

## Q7 — Nested scope and shadowing

```js-exec
var x = "outer";

function test() {
  console.log(x);
  var x = "inner";
  console.log(x);
}

test();
console.log(x);
```

<details>
<summary>Show answer</summary>

**Output:**
```
undefined
inner
outer
```

**Why:** Inside `test()`, `var x` is hoisted to the top of the function, creating a *shadow* of the outer `x`. At the first `console.log`, the inner `x` exists (hoisted) but hasn't been assigned yet — `undefined`. After the assignment it becomes `"inner"`. The outer `x` is unaffected, so the final log is `"outer"`.

</details>

---

## Q8 — const must be initialised

```js-exec
try {
  const c;
} catch (e) {
  console.log(e.constructor.name);
}
```

<details>
<summary>Show answer</summary>

**Output:**
```
SyntaxError
```

**Why:** `const` requires an initialiser at the point of declaration — `const c;` is a syntax error, not just a runtime error. The engine catches it before any code runs. You can't declare a `const` and assign it later; the initial value must be provided on the same line.

</details>

---

## Q9 — Hoisting across multiple var declarations

```js-exec
function run() {
  console.log(a, b);
  var a = 1;
  var b = 2;
  console.log(a, b);
}
run();
```

<details>
<summary>Show answer</summary>

**Output:**
```
undefined undefined
1 2
```

**Why:** Both `var a` and `var b` are hoisted to the top of `run()`, but both start as `undefined` until their assignments execute. The first log fires before either assignment, printing `undefined undefined`. The second fires after both assignments.

</details>

---

## Q10 — let in a nested block

```js-exec
let x = "global";

{
  console.log(x);
  let x = "block";
  console.log(x);
}

console.log(x);
```

<details>
<summary>Show answer</summary>

**Output:**
```
ReferenceError (caught if not wrapped in try/catch)
block
global
```

**Why:** Inside the `{}` block, `let x = "block"` creates a new binding that shadows the outer `x`. But from the *start* of that block until the `let x` line, the inner `x` is in the TDZ. The first `console.log(x)` inside the block is in the TDZ — it throws a `ReferenceError`. After the declaration, the block's `x` is `"block"`. The outer `x` remains `"global"` throughout.

</details>

---

## Key Rules

| Keyword | Hoisted? | Initial value | Scope | TDZ? |
|---|---|---|---|---|
| `var` | Yes | `undefined` | Function / global | No |
| `let` | Yes (TDZ) | — | Block | Yes |
| `const` | Yes (TDZ) | — | Block | Yes |
| `function` declaration | Yes (fully) | The function | Function / global | No |

---

## Go Deeper

- [JS Foundations #1 — Variables, Scope & Hoisting](/articles/js-variables-scope-hoisting) — full breakdown with execution context diagrams
- [Engine #1 — Hoisting & TDZ: What the Engine Actually Does](/articles/js-hoisting-tdz-deep) — how the parser creates bindings before any code runs
- [Output Quiz #2 — Closures & the Loop Problem](/articles/js-output-closures) — the next quiz in this series
