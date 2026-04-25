Multiple times, we see a recurring pattern:

- Designers hand over a Figma file.
- Engineers feed it into Claude (or any LLM) using MCP.
- `figma.get_screenshot()` looks perfect.
- `figma.get_design_context()` and `figma.get_metadata()` return structured data.
- The generated HTML/CSS is inaccurate, inconsistent, or completely wrong.

At first glance, this looks like an LLM problem.

In reality, it is usually a **design structure problem**.

---

# The Core Problem: Visual Truth vs Structural Truth

There are two “truths” in a Figma file:

### 1. Visual Truth  
What `figma.get_screenshot()` shows.

- Perfect spacing
- Clean alignment
- Proper visual grouping
- Pixel-perfect UI

### 2. Structural Truth  
What `figma.get_design_context()` and `figma.get_metadata()` expose.

- Frame hierarchy
- Auto-layout configuration
- Constraints
- Padding
- Absolute positioning
- Group nesting
- Component structure

When the Figma file has proper semantic structure — clean auto-layout, meaningful naming, logical hierarchy — metadata becomes extremely powerful. Combined with the screenshot, it produces accurate and stable UI code.

But when semantics are weak — messy nesting, generic names, heavy absolute positioning — structural data becomes noise. In such cases, the screenshot alone often yields better results.

---

# Frames ≠ HTML Elements

In Figma:

- Everything is a Frame
- Components wrap Frames
- Auto-layout wraps Frames
- Variants wrap Components

But in real UI:

- `<section>`
- `<button>`
- `<img>`
- `<header>`

There is no 1:1 mapping.

When the model sees:

```
Frame → Frame → Frame → Frame
```

It cannot reliably determine:
- Which frame is layout?
- Which frame is semantic?
- Which frame is decorative?

This ambiguity leads to:
- Extra divs
- Wrong nesting
- Lost hierarchy
- Over-complicated markup
---

# Over-Nesting from Design Convenience

Designers often:

- Wrap elements in extra frames for spacing
- Add invisible layers
- Use groups for alignment
- Duplicate components instead of variants

Visually harmless.

Structurally disastrous.

Example:

```
Frame
 ├─ Frame
 │   ├─ Frame
 │   │   ├─ Text
```

LLM sees depth → assumes hierarchy.

But the hierarchy is artificial.



---
# Structural Drift Between Visual and Logical Hierarchy

Designers optimize for:

- Pixel perfection
- Layout flexibility
- Component reusability

Developers need:

- Semantic grouping
- Accessibility hierarchy
- Logical DOM order

When visual grouping differs from logical grouping:

The LLM must guess.

Guessing leads to hallucination.

---

# Decorative Layers Polluting Context

Common issues:

- Background rectangles
- Overlay masks
- Vector shapes
- Absolute-positioned elements

They appear in metadata as full structural nodes.

But visually they are decorative.

Without filtering:

The model may:
- Convert them into HTML nodes
- Misinterpret them as content elements
- Inflate DOM structure

---

# Naming is Everything

LLMs rely heavily on tokens.

If your Figma tree says:

```
Frame
 ├─ Frame
 ├─ Frame
 ├─ Text
```

You get generic output.

If it says:

```
ProductCard
 ├─ ProductImage
 ├─ ProductTitle
 ├─ AddToCartButton
```

You get structured output.

Naming acts as semantic metadata.

Poor naming destroys interpretability.

---

# What We Can Fix

## 1. Enforce Semantic Naming

Avoid:
```
Frame 12
Group 45
Rectangle 8
```

Prefer:
```
Navbar
HeroSection
ProductGrid
CTAButton
```

---

## 2. Reduce Artificial Nesting

Before handing to MCP:

- Flatten unnecessary frames
- Remove empty containers
- Eliminate layout-only wrappers where possible

---

## 3. Separate Decorative Layers

Clearly isolate:
- Background layers
- Visual effects
- Shadows
- Masks

So they can be filtered before passing to LLM.

---

## 4. Standardize Component Contracts

Define:

- Button
- Card
- Modal
- Input

With consistent naming and internal structure.

Do not let every page reinvent structure.

---


# What You Cannot Fix

We cannot remove:

- Frames
- Components
- Auto Layout
- Variants

They are core to Figma.

The goal is not elimination.

The goal is **normalization and clarity**.

---

# Figma + LLM Is a Workflow Shift

It is controlling what the model sees.

Instead of blindly passing the entire design tree,  
we intentionally curate context.

This changes reliability.

---

# Practical Upgrades

## 1. Conscious Token Reduction

Most pipelines:

- Send full trees  
- Include hidden layers  
- Include decorative SVGs  
- Include images  
- Include unused components  

This increases ambiguity and cost.

Instead:

- Remove hidden layers  
- Exclude decorative elements  
- Strip unnecessary wrappers  
- Pass only meaningful structural nodes  

### Outcome

- Fewer tokens  
- Lower cost  
- Faster responses  
- Improved reasoning clarity  
- Reduced hallucination  

Token reduction improves reasoning — not just budget.

---

## 2. Treat Component Names as Contracts

Old approach:

> Screenshot → “Generate this UI.”

Improved approach:

> Structured design → Named components → Explicit intent.

If components are clearly named:

- `LoginButton`
- `ProductCard`
- `HeroSection`
- `CheckoutForm`

The model reasons from intent instead of pixels.

Figma becomes a semantic contract.

---

## 3. Multi-Page Awareness

Figma already encodes:

- Page names  
- Frame names  
- Component names  

Example:

- Button: `GoToCheckout`  
- Page: `CheckoutPage`

Now interaction can be explicit:

> On click of `GoToCheckout`, navigate to `CheckoutPage`.

No screenshot inference required.

---

## 4. Intra-Page Interaction Clarity

Consistent naming enables clear mapping:

- `OpenModalButton`
- `SignupModal`
- `SidebarToggle`
- `SidebarPanel`

Instruction becomes deterministic:

> On click of `OpenModalButton`, show `SignupModal`.

Ambiguity disappears.

---

## 5. Responsive Alignment

Instead of sending one screenshot:

- Provide mobile and desktop structures  
- Ensure component names match across breakpoints  

If `ProductCard` exists in both:

The model understands:

- Same component  
- Different layout rules  

This enables structural responsive reasoning.

---

## 6. Intentional MCP Usage

Stop passively accepting raw MCP output.

Instead:

- Decide what to extract  
- Decide what to exclude  
- Normalize before passing to the LLM  
- Leverage component names deliberately  

Control the abstraction layer.

---

# The Mental Model Shift

Before:

> Screenshot → “Build this.”

Now:

> Structured design → Clean metadata → Explicit contracts → Controlled context.

This encourages:

- Strong naming discipline  
- Cleaner design systems  
- Better interaction modeling  
- Reduced token usage  
- Higher generation reliability  

---

# Final Takeaways

- Visually perfect designs can be structurally misleading.  
- Figma metadata is not equivalent to rendered intent.  
- Screenshots and design trees represent different realities.  
- Naming and structural discipline matter more than pixel precision.  
- Normalization before LLM ingestion is critical.  
- Uncontrolled MCP usage increases context size and reduces output quality.  

This is not wasted effort.

It is a shift from:

> AI guessing from pixels  

to  

> AI reasoning from structure.

If you want reliable AI-generated UI code:

Design not just for humans.

Design for machines.