const e=`# Figma MCP Integration Guide

The **Figma MCP server** provides a set of tools that enable LLMs to translate and interpret designs from Figma. Once connected, your MCP client can access specific design nodes programmatically.

---

## 🚀 Figma MCP Setup

### 1️⃣ Add the Remote Figma MCP Server

Run the following command in your terminal to add the remote Figma MCP server to Claude Code:

\`\`\`bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
\`\`\`

---

### 2️⃣ Authenticate Figma MCP

1. Open Claude Code.
2. Type:

\`\`\`bash
/mcp
\`\`\`

3. Select the **figma** server.
4. Choose **Authenticate**.
5. Your browser will open and prompt you to authorize Claude to access your Figma account.
6. Complete the authorization process.

---

### 3️⃣ Verify Connection

Run:

\`\`\`bash
/mcp
\`\`\`

The Figma server should now show a **green status** or a **"connected"** message.

---

## 🔧 Optimize Token Utilization

To improve token efficiency across all MCP servers, add the following line to your \`.bashrc\`:

\`\`\`bash
export ENABLE_EXPERIMENTAL_MCP_CLI=true
\`\`\`

Then reload your shell:

\`\`\`bash
source ~/.bashrc
\`\`\`

---

# Figma MCP Tools

## 📸 \`figma.get_screenshot\`

**Purpose:**  
Takes a screenshot of the selected Figma node.

**Use Case:**  
Useful when the LLM needs a visual representation of a component or frame.

---

## 🧠 \`figma.get_design_context\`

**Purpose:**  
Extracts structured design metadata from a Figma file or selected node so that an LLM can understand the design in a machine-consumable format.

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

## 🏷️ \`figma.get_metadata\`

**Purpose:**  
A lightweight introspection call that returns descriptive metadata about a Figma file or node — without returning the full layout tree.

If \`get_design_context\` focuses on structural layout and styling,  
\`get_metadata\` focuses on identity and high-level classification.

### Answers Questions Like:

- What is this node?
- Is it a component or an instance?
- What page is it on?
- What are its IDs?
- What styles are applied?
- What are the component relationships?


---



#  Figma MCP Design Extraction Example

![Phone input component in Figma](https://github.com/user-attachments/assets/9db722e2-f61f-4922-b42d-02b4f4539d2f)

## 🔹 get_screenshot (MCP)

\`\`\`
figma - get_screenshot (MCP)(fileKey: "26FE6n6l1KYh6y5oKIrDs3", nodeId: "3539:1671", clientLanguages: "html,css,javascript,python", clientFrameworks: "django")
\`\`\`

Output:
\`\`\`
[Image]
\`\`\`

---

## 🔹 get_design_context (MCP)

\`\`\`
figma - get_design_context (MCP)(fileKey: "26FE6n6l1KYh6y5oKIrDs3", nodeId: "3539:1671", clientLanguages: "html,css,javascript,python", clientFrameworks: "django")
\`\`\`

### Returned Code (React + Tailwind)

\`\`\`jsx
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
\`\`\`

---

SUPER CRITICAL: The generated React+Tailwind code MUST be converted to match the target project's technology stack and styling system.

1. Analyze the target codebase to identify: technology stack, styling approach, component patterns, and design tokens 
2. Convert React syntax to the target framework/library 
3. Transform all Tailwind classes to the target styling system while preserving exact visual design 
4. Follow the project's existing patterns and conventions DO NOT install any Tailwind as a dependency unless the user instructs you to do so.

- Node ids have been added to the code as data attributes, e.g. data-node-id="1:2".  
- Images and SVGs will be stored as constants, e.g. const image = 'https://www.figma.com/api/mcp/asset/550e8400-e29b-41d4-a716-446655440000'. These constants will be used in the code as the source for the image, ex: <img src={image} />. Image assets are stored on a remote server for 7 days and can be fetched using the provided URLs until they expire.  
- IMPORTANT: After you call this tool, you MUST call get_screenshot to get a screenshot of the node for context.

---

## 🔹 get_metadata (MCP)

\`\`\`
figma - get_metadata (MCP)(fileKey: "26FE6n6l1KYh6y5oKIrDs3", nodeId: "3539:1671", clientLanguages: "html,css,javascript,python", clientFrameworks: "django")
\`\`\`

### Returned Metadata

\`\`\`xml
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
\`\`\`

---

- IMPORTANT: After you call this tool, you MUST call get_design_context if trying to implement the design, since this tool only returns metadata. If you do not call get_design_context, the agent will not be able to implement the design.



# Claude Interpretation from figma mcp tool data


![Claude + Figma MCP — Design Context output](claude-figma-mcp-integration1.png)

![Claude + Figma MCP — Node Structure & Metadata](claude-figma-mcp-integration2.png)
`;export{e as default};
