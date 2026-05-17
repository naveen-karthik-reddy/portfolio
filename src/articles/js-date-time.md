JavaScript's `Date` object handles timestamps, formatting, and time arithmetic. It's used in interviews for timing (throttle, debounce), timestamp generation, and date manipulation. This covers the practical methods you'll reach for.

---

## 1. Creating Dates

```js-exec
// Current moment
const now = new Date();
console.log(now);  // e.g., "2026-05-17T..."

// From timestamp (milliseconds since Jan 1, 1970 UTC)
console.log(new Date(0));             // 1970-01-01T00:00:00.000Z
console.log(new Date(1715904000000)); // specific date

// From string
console.log(new Date('2024-01-15'));             // ISO format
console.log(new Date('2024-01-15T10:30:00Z'));   // ISO with time

// From components (year, monthIndex, day, hours, minutes, seconds, ms)
console.log(new Date(2024, 0, 15));              // Jan 15, 2024 (month is 0-based!)
console.log(new Date(2024, 0, 15, 10, 30, 0));   // Jan 15, 2024 10:30:00
```

**Month is 0-based** — `0` = January, `11` = December. This is the most common Date pitfall.

---

## 2. Getting Timestamps

```js-exec
const now = new Date();

// Milliseconds since epoch
console.log(now.getTime());       // e.g., 1747459200000
console.log(Date.now());          // same — but static, no need to create Date

// Seconds since epoch
console.log(Math.floor(Date.now() / 1000));
```

**Interview use**: `Date.now()` in throttle (#9) to check if enough time has elapsed since the last call.

---

## 3. Getting Date Components

```js-exec
const d = new Date('2024-06-15T14:30:45Z');

// UTC methods
console.log(d.getUTCFullYear());  // 2024
console.log(d.getUTCMonth());     // 5  (June — 0-based)
console.log(d.getUTCDate());      // 15
console.log(d.getUTCHours());     // 14
console.log(d.getUTCMinutes());   // 30
console.log(d.getUTCSeconds());   // 45
console.log(d.getUTCDay());       // 6  (Saturday — 0=Sunday)

// Local time methods (same names without UTC)
console.log(d.getFullYear());     // depends on timezone
console.log(d.getMonth());        // depends on timezone
console.log(d.getDate());         // depends on timezone
```

Always prefer UTC methods to avoid timezone surprises. Store and transmit dates in ISO 8601 / UTC.

---

## 4. Setting Date Components

```js-exec
const d = new Date('2024-01-15');
d.setFullYear(2025);
d.setMonth(5);      // June (0-based)
console.log(d);     // 2025-06-15...
```

Setters mutate the Date object. They auto-correct overflow: `setDate(0)` goes to the last day of the previous month.

---

## 5. Date Arithmetic

Subtract dates to get milliseconds; divide to get other units:

```js-exec
const start = new Date('2024-01-01');
const end = new Date('2024-01-15');

const diffMs = end - start;  // subtraction calls valueOf() → timestamp
console.log(diffMs);                    // 1209600000 (ms)
console.log(diffMs / 1000);            // 1209600 (seconds)
console.log(diffMs / 1000 / 60);       // 20160 (minutes)
console.log(diffMs / 1000 / 60 / 60);  // 336 (hours)
console.log(diffMs / 1000 / 60 / 60 / 24); // 14 (days)

// Add days
const tomorrow = new Date(start);
tomorrow.setDate(tomorrow.getDate() + 1);
console.log(tomorrow.toISOString());  // 2024-01-02...
```

---

## 6. Formatting Dates

### ISO 8601 (Preferred for Storage/Transmission)

```js-exec
const d = new Date('2024-06-15T14:30:45.123Z');
console.log(d.toISOString());      // '2024-06-15T14:30:45.123Z'
console.log(d.toJSON());           // same — JSON.stringify calls toJSON
```

### Locale-Aware Formatting

```js-exec
const d = new Date('2024-06-15T14:30:45Z');
console.log(d.toLocaleDateString('en-US'));  // '6/15/2024'
console.log(d.toLocaleDateString('en-GB'));  // '15/06/2024'
console.log(d.toLocaleString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
}));  // 'June 15, 2024'
```

### Human-Readable

```js-exec
const d = new Date('2024-06-15T14:30:45Z');
console.log(d.toString());       // 'Sat Jun 15 2024 ...'
console.log(d.toDateString());   // 'Sat Jun 15 2024'
console.log(d.toTimeString());   // '14:30:45 GMT+0000 ...'
```

---

## 7. `performance.now()` — High-Resolution Timing

For measuring code execution time, use `performance.now()` instead of `Date.now()`:

```js-exec
const t0 = performance.now();
// ... some operation ...
const t1 = performance.now();
console.log(`${(t1 - t0).toFixed(3)}ms`);
```

`performance.now()` returns milliseconds with microsecond precision (fractional) and is monotonic — it never goes backwards, unlike system clock changes.

**Interview use**: Measuring algorithm runtime in complexity analysis.

---

## 8. Parsing Dates Reliably

```js-exec
// ISO 8601 is the only reliably parsed format across browsers
console.log(new Date('2024-01-15'));           // ✓ reliable
console.log(new Date('2024-01-15T10:30:00Z')); // ✓ reliable (UTC)

// Ambiguous formats — avoid
console.log(new Date('01/15/2024'));  // US locale only — avoid
console.log(new Date('15-01-2024'));  // ambiguous — avoid

// Safest: parse manually or use a library
function parseDate(str) {
  const d = new Date(str);
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${str}`);
  return d;
}
```

---

## 9. Checking Validity

```js-exec
function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

console.log(isValidDate(new Date('2024-01-15')));  // true
console.log(isValidDate(new Date('invalid')));     // false
console.log(isValidDate(new Date(NaN)));           // false
```

---

## Quick Reference

| Method | Returns |
|-|-|
| `Date.now()` | Current timestamp (ms) |
| `new Date()` | Current date/time |
| `new Date(ms)` | Date from timestamp |
| `new Date(str)` | Date from ISO string |
| `d.getTime()` | Timestamp (ms) |
| `d.getFullYear()` | Year (4 digits) |
| `d.getMonth()` | Month (0–11) |
| `d.getDate()` | Day of month (1–31) |
| `d.getHours()` / `getMinutes()` / `getSeconds()` | Time components |
| `d.setDate(n)` | Set day (mutates) |
| `d.toISOString()` | ISO 8601 string |
| `d.toLocaleDateString(locale)` | Locale-formatted date |
| `performance.now()` | High-res monotonic time |

---

## Interview Tips

- **Use `Date.now()` for timing** — no need to create a `Date` object for a timestamp.
- **Use `performance.now()` for benchmarks** — higher precision and monotonic.
- **Use UTC methods for consistency** — `getUTCFullYear()`, not `getFullYear()`.
- **Remember month is 0-based** — `new Date(2024, 0)` is January, not December.

---

## Related Articles

- [#8 — Implement debounce()](/articles/js-interview-debounce)
- [#9 — Implement throttle()](/articles/js-interview-throttle)
- [#28 — Deep Clone with Circular References](/articles/js-interview-deep-clone-circular)
