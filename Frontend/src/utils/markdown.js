// remark-math only recognizes $...$ (inline) and $$...$$ (block) delimiters.
// LLMs frequently fall back to the other standard LaTeX delimiters —
// \( ... \) and \[ ... \] — regardless of prompting, since that's the more
// common style in their training data. This normalizes either style to the
// one remark-math understands, so math renders reliably either way.
export function normalizeLatexDelimiters(text) {
    if (!text) return text;
    return text
        .replace(/\\\[([\s\S]*?)\\\]/g, (_, expr) => `$$${expr.trim()}$$`)
        .replace(/\\\(([\s\S]*?)\\\)/g, (_, expr) => `$${expr.trim()}$`);
}