/**
 * Atlassian Document Format (ADF) → plain text extraction.
 *
 * Jira REST v3 returns `description` and comment `body` as ADF documents,
 * not strings. Evidence extraction must see the real text; a silently-empty
 * description would disable contradiction detection entirely.
 *
 * ADF spec: https://developer.atlassian.com/cloud/jira/platform/documents/
 * Marks (links, bold, …) are dropped; text content of paragraph, heading,
 * list, code and similar nodes is kept. Unknown node types are traversed
 * defensively rather than throwing.
 */

interface AdfNode {
  type?: string;
  text?: string;
  content?: AdfNode[];
}

/** Extract readable text from an ADF document. Returns '' for non-objects. */
export function adfToText(value: unknown): string {
  if (typeof value === 'string') return value; // tolerate plain strings defensively
  if (!isAdfNode(value)) return '';
  const lines: string[] = [];
  walk(value, lines);
  return lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join('\n');
}

function isAdfNode(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Depth-first walk. Inline `text` children concatenate onto the current line;
 * a block child starts a new line. `fresh` marks whether the next inline text
 * must open a new line.
 */
function walk(node: AdfNode, lines: string[]): void {
  let fresh = true;
  if (!Array.isArray(node.content)) return;
  for (const child of node.content) {
    if (!child) continue;
    if (typeof child.text === 'string') {
      if (fresh || lines.length === 0) lines.push(child.text);
      else lines[lines.length - 1] = `${lines[lines.length - 1]}${child.text}`;
      fresh = false;
    } else {
      walk(child, lines);
      fresh = true;
    }
  }
}

/** True when a field value is an ADF document (object with a type). */
export function isAdfDocument(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).type === 'string'
  );
}

/**
 * Plain text → ADF document, for Jira REST v3 write payloads
 * (issue creation, comments). Empty input yields an empty document.
 */
export function textToAdfDoc(text: string): Record<string, unknown> {
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return {
    type: 'doc',
    version: 1,
    content: paragraphs.map((p) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p }],
    })),
  };
}
