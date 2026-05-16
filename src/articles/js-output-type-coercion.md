JavaScript's type coercion rules are surprisingly consistent once you know them — but they produce outputs that look wrong until you do. Ten questions covering the `+` operator, `==` abstract equality, truthy/falsy edge cases, and object-to-primitive conversion.

---

## Q1 — String + Number

```js-exec
console.log(1 + "2");
console.log("3" - 1);
console.log("3" * "2");
```

<details>
<summary>Show answer</summary>

**Output:**
```
12
2
6
```

**Why:** The `+` operator has a special rule: if *either* operand is a string, it performs **string concatenation** instead of addition. `1 + "2"` → `"12"`. The `-` and `*` operators have no string mode — they always coerce both operands to numbers. `"3" - 1` → `3 - 1 = 2`. `"3" * "2"` → `3 * 2 = 6`.

</details>

---

## Q2 — Adding arrays

```js-exec
console.log([] + []);
console.log([] + {});
console.log({} + []);
```

<details>
<summary>Show answer</summary>

**Output:**
```
""
"[object Object]"
"[object Object]"
```

**Why:** `[]` coerces to `""` (empty string via `.toString()`). `{}` coerces to `"[object Object]"`. So `[] + []` → `"" + ""` → `""`. `[] + {}` → `"" + "[object Object]"` → `"[object Object]"`. The third line looks identical but if typed directly in the browser console, `{}` at the start of a statement is treated as an empty block, not an object — making it `+[]` = `0`. Inside `console.log()` both are object literals, so the result is the same as the second line.

</details>

---

## Q3 — == with null and undefined

```js-exec
console.log(null == undefined);
console.log(null == 0);
console.log(null == false);
console.log(undefined == false);
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
false
false
false
```

**Why:** `null == undefined` is `true` by spec — it's a special case. `null` and `undefined` only `==` each other and themselves; they do **not** coerce to `0` or `false` in abstract equality comparisons. This means you can safely use `x == null` to check for both `null` and `undefined` simultaneously.

</details>

---

## Q4 — [] == ![]

```js-exec
console.log([] == ![]);
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
```

**Why:** `![]` evaluates first: `[]` is truthy, so `![]` is `false`. Now it's `[] == false`. `false` converts to `0`. `[]` converts to `""` (via `.toString()`), then `""` converts to `0`. So it's `0 == 0` → `true`. This is the most infamous JS coercion result — and a perfect reason to use `===`.

</details>

---

## Q5 — Unary + operator

```js-exec
console.log(+[]);
console.log(+{});
console.log(+"3");
console.log(+true);
console.log(+null);
console.log(+undefined);
```

<details>
<summary>Show answer</summary>

**Output:**
```
0
NaN
3
1
0
NaN
```

**Why:** Unary `+` converts the operand to a number. `+[]` → `+""` → `0`. `+{}` → `+"[object Object]"` → `NaN` (not a valid number string). `+"3"` → `3`. `+true` → `1`. `+null` → `0`. `+undefined` → `NaN`. These coercions happen via the `ToNumber` abstract operation.

</details>

---

## Q6 — Falsy values

```js-exec
const falsy = [false, 0, "", null, undefined, NaN];
falsy.forEach(v => {
  if (!v) console.log(String(v), "is falsy");
});
```

<details>
<summary>Show answer</summary>

**Output:**
```
false is falsy
0 is falsy
 is falsy
null is falsy
undefined is falsy
NaN is falsy
```

**Why:** There are exactly six falsy values in JavaScript: `false`, `0`, `""` (empty string), `null`, `undefined`, and `NaN`. Everything else — including `"0"`, `[]`, `{}`, and `0n` (BigInt zero is falsy too) — is truthy. Notably: `"0"`, `[]`, and `{}` are all truthy even though they might seem "empty".

</details>

---

## Q7 — == with objects

```js-exec
const a = { valueOf() { return 1; } };
const b = { valueOf() { return 1; } };

console.log(a == 1);
console.log(a == b);
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
false
```

**Why:** When `==` compares an object with a number, the object is converted to a primitive via `ToPrimitive` — which calls `valueOf()` first. `a.valueOf()` returns `1`, so `a == 1` becomes `1 == 1` → `true`. But `a == b` is an object-to-object comparison — `==` only returns `true` for the same reference, never by value. Since `a` and `b` are different objects, `a == b` is `false`.

</details>

---

## Q8 — typeof edge cases

```js-exec
console.log(typeof null);
console.log(typeof undefined);
console.log(typeof NaN);
console.log(typeof function(){});
console.log(typeof []);
```

<details>
<summary>Show answer</summary>

**Output:**
```
object
undefined
number
function
object
```

**Why:** `typeof null` returning `"object"` is a historical bug in JavaScript — `null` is not an object. `typeof NaN` returns `"number"` — NaN stands for "Not a Number" but is typed as a number. `typeof function(){}` is `"function"` (a special case — functions are objects but get their own type string). `typeof []` is `"object"` — arrays are objects; use `Array.isArray()` to distinguish them.

</details>

---

## Q9 — String comparison (lexicographic)

```js-exec
console.log("10" > "9");
console.log(10 > 9);
console.log("10" > 9);
```

<details>
<summary>Show answer</summary>

**Output:**
```
false
true
true
```

**Why:** When both operands of `>` are strings, JavaScript compares them **lexicographically** (character by character). `"1"` has a lower char code than `"9"`, so `"10" > "9"` is `false`. When at least one operand is a number, both are coerced to numbers: `"10"` → `10`, and `10 > 9` is `true`.

</details>

---

## Q10 — Template literal coercion

```js-exec
console.log(`${null}`);
console.log(`${undefined}`);
console.log(`${{}}`);
console.log(`${[1, 2, 3]}`);
```

<details>
<summary>Show answer</summary>

**Output:**
```
null
undefined
[object Object]
1,2,3
```

**Why:** Template literals call `String()` on each interpolated value (via `ToString` abstract operation). `String(null)` → `"null"`. `String(undefined)` → `"undefined"` (unlike `+ undefined` which gives `NaN`). `String({})` → `"[object Object]"`. `String([1,2,3])` → `"1,2,3"` (via `.join(",")`).

</details>

---

## Key Rules

| Operation | Rule |
|---|---|
| `+` (binary) | If either side is a string → concatenate. Otherwise → add numbers. |
| `-`, `*`, `/` | Always coerce both sides to numbers. |
| `==` | Coerces types (see spec table). Use `===` to avoid surprises. |
| `null == undefined` | `true`. `null`/`undefined` don't `==` anything else. |
| `!x` | Converts to boolean, then negates. |
| `+x` (unary) | Converts to number via `ToNumber`. |
| `typeof null` | `"object"` — a historical bug. |
| Template literals | Calls `String()` on values — `null` and `undefined` become their string names. |

---

## Go Deeper

- [JS Foundations #5 — Equality & Type Coercion](/articles/js-equality-coercion) — the full abstract equality algorithm with spec walk-through
- [Output Quiz #4 — this Binding & Arrow Functions](/articles/js-output-this-binding) — the previous quiz
- [Output Quiz #6 — Promises & async/await Ordering](/articles/js-output-promises-async) — the next quiz
