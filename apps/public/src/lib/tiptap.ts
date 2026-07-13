/**
 * Serializador JSON (ProseMirror/TipTap) → HTML, sin dependencias de DOM,
 * seguro para el runtime de Cloudflare (workerd). Cubre el subconjunto que
 * produce el editor del panel (StarterKit).
 */

interface Node {
  type: string;
  content?: Node[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyMarks(text: string, marks?: Node['marks']): string {
  if (!marks) return text;
  let out = text;
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        out = `<strong>${out}</strong>`;
        break;
      case 'italic':
        out = `<em>${out}</em>`;
        break;
      case 'strike':
        out = `<s>${out}</s>`;
        break;
      case 'code':
        out = `<code>${out}</code>`;
        break;
      case 'link': {
        const href = String(mark.attrs?.href ?? '#');
        out = `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${out}</a>`;
        break;
      }
    }
  }
  return out;
}

function renderNodes(nodes: Node[] = []): string {
  return nodes.map(renderNode).join('');
}

function renderNode(node: Node): string {
  switch (node.type) {
    case 'text':
      return applyMarks(escapeHtml(node.text ?? ''), node.marks);
    case 'paragraph':
      return `<p>${renderNodes(node.content)}</p>`;
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 2), 2), 3);
      return `<h${level}>${renderNodes(node.content)}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${renderNodes(node.content)}</ul>`;
    case 'orderedList':
      return `<ol>${renderNodes(node.content)}</ol>`;
    case 'listItem':
      return `<li>${renderNodes(node.content)}</li>`;
    case 'blockquote':
      return `<blockquote>${renderNodes(node.content)}</blockquote>`;
    case 'codeBlock':
      return `<pre><code>${renderNodes(node.content)}</code></pre>`;
    case 'hardBreak':
      return '<br />';
    case 'horizontalRule':
      return '<hr />';
    default:
      // Nodo desconocido: renderiza su contenido para no perder texto.
      return renderNodes(node.content);
  }
}

export function renderTiptap(doc: unknown): string {
  const node = doc as Node | null;
  if (!node || node.type !== 'doc') return '';
  return renderNodes(node.content);
}
