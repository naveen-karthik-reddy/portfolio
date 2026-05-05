**JIT** (Just-In-Time) compilation is a hybrid approach to executing code — it combines an interpreter (which runs code immediately) with a compiler (which produces optimized machine code for frequently used functions). V8, the JavaScript engine in Chrome and Node.js, uses JIT to make JavaScript run close to native speed.

---

## Interpreter vs Compiler: Two Extremes

A pure **interpreter** reads source code line by line and executes it immediately. It starts fast — no waiting for compilation — but runs slow, because each line is re-translated every time it's encountered.

A pure **compiler** (AOT — Ahead of Time) translates the entire program to machine code before execution. It runs fast because the translation is done once, but startup is slow — especially for large programs — and the compiler can't observe how the code actually runs.

JIT sits in the middle: start with the interpreter for fast startup, then compile the parts that matter.

```text
Pure interpreter:
  Start → [interpret] → [interpret] → [interpret] → Done
           fast start    slow runtime

Pure compiler (AOT):
  Start → [compile all] → [run native] → Done
           slow start     fast runtime

JIT:
  Start → [interpret] → [compile hot code] → [run native] → Done
           fast start     background compile      fast runtime
```

---

## How V8's JIT Works

V8 (Chrome, Node.js, Edge) uses a two-tier JIT pipeline:

**Ignition** is the interpreter. It parses JavaScript into an AST, compiles it to compact **bytecode**, and executes that bytecode immediately. Bytecode is faster to produce than machine code and uses less memory — ideal for code that runs once or infrequently.

**TurboFan** is the optimizing compiler. It identifies "hot" functions — functions called many times — and compiles them to highly optimized machine code based on the types it has observed.

```text
JavaScript source
  ↓
Parser → AST
  ↓
Ignition (interpreter) → bytecode (fast to produce, runs immediately)
  ↓ [if function is "hot" — called frequently]
TurboFan (compiler) → optimized machine code (takes longer to produce, runs much faster)
```

---

## The Optimization: Speculative Compilation

TurboFan doesn't just translate bytecode to machine code — it **specializes** the output based on what it has observed. If a function always receives two numbers and returns a number, TurboFan compiles it assuming that will always be true. The resulting machine code is single-purpose and fast.

If that assumption later breaks — a string arrives where a number was expected — TurboFan **deoptimizes**: discards the optimized code and falls back to the interpreter. Deoptimization is cheap as a one-off event but hurts throughput if it happens frequently.

This is why consistent types in hot functions matter for JavaScript performance. A function that always receives objects of the same shape stays optimized. A function that receives five different object shapes keeps deoptimizing and re-optimizing.

---

## JIT vs AOT

| | JIT (JavaScript, Java, C#) | AOT (C, Rust, Go) |
|---|---|---|
| Startup | Fast (interpreter starts immediately) | Slower (must compile first) |
| Peak performance | Close to native, needs warm-up | Native from the start |
| Optimization data | Real runtime types | Static analysis only |
| Binary size | Bytecode + compiled code | Compiled code only |
| Adaptive to usage patterns | Yes — only hot code gets compiled | No — everything is compiled |

---

JIT compilation is the reason JavaScript can run at near-native speed despite being a dynamically typed, high-level language. The engine does the hard work of making your code fast — but it can only do that if your code is consistent enough for the optimizer to trust its assumptions.
