export function markdownToPlainText(markdown) {
  if (!markdown) return '';
  return markdown
    // Remove fenced code blocks (don't read code aloud)
    .replace(/```[\s\S]*?```/g, ' ')
    // Remove inline code
    .replace(/`[^`\n]*`/g, ' ')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Convert links to text only
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/(\*\*\*|___)([\s\S]*?)\1/g, '$2')
    .replace(/(\*\*|__)([\s\S]*?)\1/g, '$2')
    .replace(/(\*|_)([^*_\n]+)\1/g, '$2')
    // Remove blockquote markers
    .replace(/^>\s*/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, ' ')
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Collapse excess whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
