// ─────────────────────────────────────────────────────────────
// A small Markdown renderer for the text on each work's page.
//
//   # Heading            ## Smaller heading     ### Smallest
//   **bold**             *italic*  or  _italic_
//   [link text](https://example.com)
//   - a list item        1. a numbered item
//   > a quote
//   ---                  a dividing line
//
// A blank line starts a new paragraph. A single line break is kept as a
// line break. Plain HTML also works, for anything Markdown can't do.
// ─────────────────────────────────────────────────────────────

function renderMarkdown(src) {
  const blocks = String(src || "").replace(/\r\n?/g, "\n").trim().split(/\n\s*\n/);
  return blocks.map(renderMarkdownBlock).join("\n");
}

// A block can mix kinds of lines, e.g. a sentence followed directly by a
// list. Consecutive lines of the same kind are grouped together.
const MD_BULLET = /^\s*[-*+]\s+/;
const MD_NUMBER = /^\s*(\d+)[.)]\s+/;
const MD_QUOTE = /^>\s?/;
const MD_HEADING = /^(#{1,3})\s+(.*)$/;

function renderMarkdownBlock(block) {
  if (/^(-{3,}|\*{3,})$/.test(block.trim())) return "<hr>";   // dividing line

  const kindOf = (l) =>
    MD_HEADING.test(l) ? "heading" :
    MD_BULLET.test(l) ? "ul" :
    MD_NUMBER.test(l) ? "ol" :
    MD_QUOTE.test(l) ? "quote" : "text";

  // Group consecutive lines of the same kind
  const groups = [];
  for (const line of block.split("\n")) {
    const kind = kindOf(line);
    const last = groups[groups.length - 1];
    if (last && last.kind === kind && kind !== "heading") last.lines.push(line);
    else groups.push({ kind, lines: [line] });
  }

  return groups.map(({ kind, lines }) => {
    if (kind === "heading") {
      // The work's title is the page's main heading, so these start one level down
      const [, hashes, text] = lines[0].match(MD_HEADING);
      const level = hashes.length + 1;
      return `<h${level} class="block-heading">${mdInline(text)}</h${level}>`;
    }
    if (kind === "ul") {
      return `<ul class="block-list">${lines.map((l) => `<li>${mdInline(l.replace(MD_BULLET, ""))}</li>`).join("")}</ul>`;
    }
    if (kind === "ol") {
      const first = parseInt(lines[0].match(MD_NUMBER)[1], 10);
      const start = first !== 1 ? ` start="${first}"` : "";
      return `<ol class="block-list"${start}>${lines.map((l) => `<li>${mdInline(l.replace(MD_NUMBER, ""))}</li>`).join("")}</ol>`;
    }
    if (kind === "quote") {
      return `<blockquote>${mdInline(lines.map((l) => l.replace(MD_QUOTE, "")).join("<br>"))}</blockquote>`;
    }
    return `<p class="block-text">${mdInline(lines.join("<br>"))}</p>`;   // line breaks kept
  }).join("\n");
}

// Bold, italics, links and inline code inside a line.
function mdInline(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
      const external = /^https?:\/\//.test(url) && !url.startsWith(location.origin);
      return `<a href="${url}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>")
    .replace(/(^|[^_\w])_([^_\s][^_]*?)_(?!\w)/g, "$1<em>$2</em>");
}
