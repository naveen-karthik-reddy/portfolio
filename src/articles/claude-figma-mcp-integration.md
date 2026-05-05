The Figma MCP server gives Claude Code a direct line into your Figma files — not just a screenshot, but the actual design tree: frame hierarchy, auto-layout config, spacing, typography, component relationships. Once it's connected, you can point Claude at any node and ask it to implement the design, and it starts from structured data rather than pixel-guessing from an image.

This guide covers setup, the three main tools the server exposes, and what to expect from each one.

---

## Figma MCP Setup

### 1. Add the Remote Figma MCP Server

Run the following command in your terminal to add the remote Figma MCP server to Claude Code:

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

---

### 2. Authenticate Figma MCP

1. Open Claude Code.
2. Type:

```bash
/mcp
```

3. Select the **figma** server.
4. Choose **Authenticate**.
5. Your browser will open and prompt you to authorize Claude to access your Figma account.
6. Complete the authorization process.

---

### 3. Verify Connection

Run:

```bash
/mcp
```

The Figma server should now show a green status or a "connected" message.

---

## Optimize Token Utilization

To improve token efficiency across all MCP servers, add the following line to your `.bashrc`:

```bash
export ENABLE_EXPERIMENTAL_MCP_CLI=true
```

Then reload your shell:

```bash
source ~/.bashrc
```

---

# Figma MCP Tools

## `figma.get_screenshot`

**Purpose:**
Takes a screenshot of the selected Figma node.

**Use Case:**
Useful when Claude needs a visual reference for a component or frame — particularly after calling `get_design_context`, to visually verify what the structural data describes.

---

## `figma.get_design_context`

**Purpose:**
Extracts structured design metadata from a Figma file or selected node so that Claude can understand the design in a machine-consumable format.

### Returns Structured Data Including:

- Node hierarchy (Frames → Groups → Layers)
- Component information (instances, variants)
- Layout constraints
- Auto-layout properties
- Spacing and padding
- Typography styles
- Colors (fills, strokes)
- Effects (shadows, blur)
- Dimensions
- Positioning
- Tokens / styles applied

---

## `figma.get_metadata`

**Purpose:**
A lightweight introspection call that returns descriptive metadata about a Figma file or node — without returning the full layout tree.

If `get_design_context` focuses on structural layout and styling, `get_metadata` focuses on identity and high-level classification.

### Answers Questions Like:

- What is this node?
- Is it a component or an instance?
- What page is it on?
- What are its IDs?
- What styles are applied?
- What are the component relationships?

---

# Figma MCP Design Extraction Example

![Phone input component in Figma](https://github.com/user-attachments/assets/9db722e2-f61f-4922-b42d-02b4f4539d2f)

## get_screenshot (MCP)

```text
figma - get_screenshot (MCP)(fileKey: "26FE6n6l1KYh6y5oKIrDs3", nodeId: "3539:1671", clientLanguages: "html,css,javascript,python", clientFrameworks: "django")
```

Output:
```text
[Image]
```

---

## get_design_context (MCP)

```text
figma - get_design_context (MCP)(fileKey: "26FE6n6l1KYh6y5oKIrDs3", nodeId: "3539:1671", clientLanguages: "html,css,javascript,python", clientFrameworks: "django")
```

### Returned Code (React + Tailwind)

```jsx
export default function Frame() {
  return (
    <div className="content-stretch flex items-center relative size-full" data-node-id="3539:1671">
      <div className="bg-[#e7e7e7] content-stretch flex items-center justify-center p-[10px] relative rounded-bl-[2px] rounded-tl-[2px] shrink-0" data-node-id="3539:1672">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#424242] text-[14px]" data-node-id="3539:1673">
          +91
        </p>
      </div>

      <div className="bg-white border border-[#e7e7e7] border-solid content-stretch flex items-center p-[10px] relative shrink-0 w-[221px]" data-node-id="3539:1674">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#888] text-[14px]" data-node-id="3539:1675">
          Enter your mobile number
        </p>
      </div>

      <div className="bg-[#1360bb] content-stretch flex items-center px-[12px] py-[10px] relative rounded-br-[2px] rounded-tr-[2px] shrink-0" data-node-id="3539:1676">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[14px] text-white" data-node-id="3539:1677">
          Continue
        </p>
      </div>
    </div>
  );
}
```

---

**Important:** The generated React + Tailwind code must be converted to match your target project's technology stack and styling system. Before using it:

1. Analyze the target codebase to identify the tech stack, styling approach, component patterns, and design tokens.
2. Convert React syntax to the target framework if needed.
3. Transform all Tailwind classes to the project's styling system while preserving the exact visual design.
4. Follow existing patterns and conventions — do not install Tailwind as a dependency unless you explicitly want it.

A few things to know about the output: node IDs are added as `data-node-id` attributes (e.g., `data-node-id="1:2"`). Images and SVGs are stored as constants pointing to temporary Figma asset URLs that expire after 7 days. After calling `get_design_context`, always follow up with `get_screenshot` to visually verify the structure the model is working from.

---

## get_metadata (MCP)

```text
figma - get_metadata (MCP)(fileKey: "26FE6n6l1KYh6y5oKIrDs3", nodeId: "3539:1671", clientLanguages: "html,css,javascript,python", clientFrameworks: "django")
```

### Returned Metadata

```xml
<frame id="3539:1671" name="Frame 1000010831" x="0" y="0" width="351" height="34">
  <frame id="3539:1672" name="Frame 1000010828" x="0" y="0" width="45" height="34">
    <text id="3539:1673" name="+91" x="10" y="10" width="25" height="14" />
  </frame>

  <frame id="3539:1674" name="Frame 1000010829" x="45" y="0" width="221" height="34">
    <text id="3539:1675" name="Enter your mobile number" x="10" y="10" width="173" height="14" />
  </frame>

  <frame id="3539:1676" name="Frame 1000010830" x="266" y="0" width="85" height="34">
    <text id="3539:1677" name="Continue" x="12" y="10" width="61" height="14" />
  </frame>
</frame>
```

---

`get_metadata` is a good first call when you want to understand what a node is before committing to a full `get_design_context` extraction. It's lightweight and tells you enough to decide whether you're looking at the right component. If you're trying to implement the design, always follow up with `get_design_context` — metadata alone doesn't give the model enough to generate accurate code.

---

# Claude Interpretation from Figma MCP Tool Data

![Claude + Figma MCP — Design Context output](claude-figma-mcp-integration1.png)

![Claude + Figma MCP — Node Structure & Metadata](claude-figma-mcp-integration2.png)
