const n=`Multiple times, we see a recurring pattern:\r
\r
- Designers hand over a Figma file.\r
- Engineers feed it into Claude (or any LLM) using MCP.\r
- \`figma.get_screenshot()\` looks perfect.\r
- \`figma.get_design_context()\` and \`figma.get_metadata()\` return structured data.\r
- The generated HTML/CSS is inaccurate, inconsistent, or completely wrong.\r
\r
At first glance, this looks like an LLM problem.\r
\r
In reality, it is usually a **design structure problem**.\r
\r
---\r
\r
# The Core Problem: Visual Truth vs Structural Truth\r
\r
There are two “truths” in a Figma file:\r
\r
### 1. Visual Truth  \r
What \`figma.get_screenshot()\` shows.\r
\r
- Perfect spacing\r
- Clean alignment\r
- Proper visual grouping\r
- Pixel-perfect UI\r
\r
### 2. Structural Truth  \r
What \`figma.get_design_context()\` and \`figma.get_metadata()\` expose.\r
\r
- Frame hierarchy\r
- Auto-layout configuration\r
- Constraints\r
- Padding\r
- Absolute positioning\r
- Group nesting\r
- Component structure\r
\r
When the Figma file has proper semantic structure — clean auto-layout, meaningful naming, logical hierarchy — metadata becomes extremely powerful. Combined with the screenshot, it produces accurate and stable UI code.\r
\r
But when semantics are weak — messy nesting, generic names, heavy absolute positioning — structural data becomes noise. In such cases, the screenshot alone often yields better results.\r
\r
---\r
\r
# Frames ≠ HTML Elements\r
\r
In Figma:\r
\r
- Everything is a Frame\r
- Components wrap Frames\r
- Auto-layout wraps Frames\r
- Variants wrap Components\r
\r
But in real UI:\r
\r
- \`<section>\`\r
- \`<button>\`\r
- \`<img>\`\r
- \`<header>\`\r
\r
There is no 1:1 mapping.\r
\r
When the model sees:\r
\r
\`\`\`\r
Frame → Frame → Frame → Frame\r
\`\`\`\r
\r
It cannot reliably determine:\r
- Which frame is layout?\r
- Which frame is semantic?\r
- Which frame is decorative?\r
\r
This ambiguity leads to:\r
- Extra divs\r
- Wrong nesting\r
- Lost hierarchy\r
- Over-complicated markup\r
---\r
\r
# Over-Nesting from Design Convenience\r
\r
Designers often:\r
\r
- Wrap elements in extra frames for spacing\r
- Add invisible layers\r
- Use groups for alignment\r
- Duplicate components instead of variants\r
\r
Visually harmless.\r
\r
Structurally disastrous.\r
\r
Example:\r
\r
\`\`\`\r
Frame\r
 ├─ Frame\r
 │   ├─ Frame\r
 │   │   ├─ Text\r
\`\`\`\r
\r
LLM sees depth → assumes hierarchy.\r
\r
But the hierarchy is artificial.\r
\r
\r
\r
---\r
# Structural Drift Between Visual and Logical Hierarchy\r
\r
Designers optimize for:\r
\r
- Pixel perfection\r
- Layout flexibility\r
- Component reusability\r
\r
Developers need:\r
\r
- Semantic grouping\r
- Accessibility hierarchy\r
- Logical DOM order\r
\r
When visual grouping differs from logical grouping:\r
\r
The LLM must guess.\r
\r
Guessing leads to hallucination.\r
\r
---\r
\r
# Decorative Layers Polluting Context\r
\r
Common issues:\r
\r
- Background rectangles\r
- Overlay masks\r
- Vector shapes\r
- Absolute-positioned elements\r
\r
They appear in metadata as full structural nodes.\r
\r
But visually they are decorative.\r
\r
Without filtering:\r
\r
The model may:\r
- Convert them into HTML nodes\r
- Misinterpret them as content elements\r
- Inflate DOM structure\r
\r
---\r
\r
# Naming is Everything\r
\r
LLMs rely heavily on tokens.\r
\r
If your Figma tree says:\r
\r
\`\`\`\r
Frame\r
 ├─ Frame\r
 ├─ Frame\r
 ├─ Text\r
\`\`\`\r
\r
You get generic output.\r
\r
If it says:\r
\r
\`\`\`\r
ProductCard\r
 ├─ ProductImage\r
 ├─ ProductTitle\r
 ├─ AddToCartButton\r
\`\`\`\r
\r
You get structured output.\r
\r
Naming acts as semantic metadata.\r
\r
Poor naming destroys interpretability.\r
\r
---\r
\r
# What We Can Fix\r
\r
## 1. Enforce Semantic Naming\r
\r
Avoid:\r
\`\`\`\r
Frame 12\r
Group 45\r
Rectangle 8\r
\`\`\`\r
\r
Prefer:\r
\`\`\`\r
Navbar\r
HeroSection\r
ProductGrid\r
CTAButton\r
\`\`\`\r
\r
---\r
\r
## 2. Reduce Artificial Nesting\r
\r
Before handing to MCP:\r
\r
- Flatten unnecessary frames\r
- Remove empty containers\r
- Eliminate layout-only wrappers where possible\r
\r
---\r
\r
## 3. Separate Decorative Layers\r
\r
Clearly isolate:\r
- Background layers\r
- Visual effects\r
- Shadows\r
- Masks\r
\r
So they can be filtered before passing to LLM.\r
\r
---\r
\r
## 4. Standardize Component Contracts\r
\r
Define:\r
\r
- Button\r
- Card\r
- Modal\r
- Input\r
\r
With consistent naming and internal structure.\r
\r
Do not let every page reinvent structure.\r
\r
---\r
\r
\r
# What You Cannot Fix\r
\r
We cannot remove:\r
\r
- Frames\r
- Components\r
- Auto Layout\r
- Variants\r
\r
They are core to Figma.\r
\r
The goal is not elimination.\r
\r
The goal is **normalization and clarity**.\r
\r
---\r
\r
# Figma + LLM Is a Workflow Shift\r
\r
It is controlling what the model sees.\r
\r
Instead of blindly passing the entire design tree,  \r
we intentionally curate context.\r
\r
This changes reliability.\r
\r
---\r
\r
# Practical Upgrades\r
\r
## 1. Conscious Token Reduction\r
\r
Most pipelines:\r
\r
- Send full trees  \r
- Include hidden layers  \r
- Include decorative SVGs  \r
- Include images  \r
- Include unused components  \r
\r
This increases ambiguity and cost.\r
\r
Instead:\r
\r
- Remove hidden layers  \r
- Exclude decorative elements  \r
- Strip unnecessary wrappers  \r
- Pass only meaningful structural nodes  \r
\r
### Outcome\r
\r
- Fewer tokens  \r
- Lower cost  \r
- Faster responses  \r
- Improved reasoning clarity  \r
- Reduced hallucination  \r
\r
Token reduction improves reasoning — not just budget.\r
\r
---\r
\r
## 2. Treat Component Names as Contracts\r
\r
Old approach:\r
\r
> Screenshot → “Generate this UI.”\r
\r
Improved approach:\r
\r
> Structured design → Named components → Explicit intent.\r
\r
If components are clearly named:\r
\r
- \`LoginButton\`\r
- \`ProductCard\`\r
- \`HeroSection\`\r
- \`CheckoutForm\`\r
\r
The model reasons from intent instead of pixels.\r
\r
Figma becomes a semantic contract.\r
\r
---\r
\r
## 3. Multi-Page Awareness\r
\r
Figma already encodes:\r
\r
- Page names  \r
- Frame names  \r
- Component names  \r
\r
Example:\r
\r
- Button: \`GoToCheckout\`  \r
- Page: \`CheckoutPage\`\r
\r
Now interaction can be explicit:\r
\r
> On click of \`GoToCheckout\`, navigate to \`CheckoutPage\`.\r
\r
No screenshot inference required.\r
\r
---\r
\r
## 4. Intra-Page Interaction Clarity\r
\r
Consistent naming enables clear mapping:\r
\r
- \`OpenModalButton\`\r
- \`SignupModal\`\r
- \`SidebarToggle\`\r
- \`SidebarPanel\`\r
\r
Instruction becomes deterministic:\r
\r
> On click of \`OpenModalButton\`, show \`SignupModal\`.\r
\r
Ambiguity disappears.\r
\r
---\r
\r
## 5. Responsive Alignment\r
\r
Instead of sending one screenshot:\r
\r
- Provide mobile and desktop structures  \r
- Ensure component names match across breakpoints  \r
\r
If \`ProductCard\` exists in both:\r
\r
The model understands:\r
\r
- Same component  \r
- Different layout rules  \r
\r
This enables structural responsive reasoning.\r
\r
---\r
\r
## 6. Intentional MCP Usage\r
\r
Stop passively accepting raw MCP output.\r
\r
Instead:\r
\r
- Decide what to extract  \r
- Decide what to exclude  \r
- Normalize before passing to the LLM  \r
- Leverage component names deliberately  \r
\r
Control the abstraction layer.\r
\r
---\r
\r
# The Mental Model Shift\r
\r
Before:\r
\r
> Screenshot → “Build this.”\r
\r
Now:\r
\r
> Structured design → Clean metadata → Explicit contracts → Controlled context.\r
\r
This encourages:\r
\r
- Strong naming discipline  \r
- Cleaner design systems  \r
- Better interaction modeling  \r
- Reduced token usage  \r
- Higher generation reliability  \r
\r
---\r
\r
# Final Takeaways\r
\r
- Visually perfect designs can be structurally misleading.  \r
- Figma metadata is not equivalent to rendered intent.  \r
- Screenshots and design trees represent different realities.  \r
- Naming and structural discipline matter more than pixel precision.  \r
- Normalization before LLM ingestion is critical.  \r
- Uncontrolled MCP usage increases context size and reduces output quality.  \r
\r
This is not wasted effort.\r
\r
It is a shift from:\r
\r
> AI guessing from pixels  \r
\r
to  \r
\r
> AI reasoning from structure.\r
\r
If you want reliable AI-generated UI code:\r
\r
Design not just for humans.\r
\r
Design for machines.`;export{n as default};
