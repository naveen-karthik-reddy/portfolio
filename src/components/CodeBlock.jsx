'use client';
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx      from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import bash     from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css      from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markup   from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import http     from "react-syntax-highlighter/dist/esm/languages/prism/http";
import json     from "react-syntax-highlighter/dist/esm/languages/prism/json";
import nginx    from "react-syntax-highlighter/dist/esm/languages/prism/nginx";
import yaml     from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js",         javascript);
SyntaxHighlighter.registerLanguage("jsx",        jsx);
SyntaxHighlighter.registerLanguage("bash",       bash);
SyntaxHighlighter.registerLanguage("css",        css);
SyntaxHighlighter.registerLanguage("html",       markup);
SyntaxHighlighter.registerLanguage("xml",        markup);
SyntaxHighlighter.registerLanguage("http",       http);
SyntaxHighlighter.registerLanguage("json",       json);
SyntaxHighlighter.registerLanguage("nginx",      nginx);
SyntaxHighlighter.registerLanguage("yaml",       yaml);

export default function CodeBlock({ language, isDark, customStyle, children }) {
  return (
    <SyntaxHighlighter
      language={language}
      style={isDark ? oneDark : oneLight}
      PreTag="div"
      customStyle={customStyle}
    >
      {children}
    </SyntaxHighlighter>
  );
}
