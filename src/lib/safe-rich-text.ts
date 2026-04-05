const ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  's',
  'section',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'u',
  'ul',
]);

const URL_ATTRS = new Set(['href', 'src']);
const GLOBAL_ATTRS = new Set(['title', 'aria-label']);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  abbr: new Set(['title']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
};

const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select']);

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeUrl(raw: string, tagName: string): boolean {
  const value = String(raw || '').trim();
  if (!value) return false;

  if (value.startsWith('#') || value.startsWith('/')) return true;
  if (tagName === 'img' && value.startsWith('data:image/')) return true;

  try {
    const url = new URL(value, 'https://www.thechoosentalks.org');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeNode(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE) return;

  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  if (BLOCKED_TAGS.has(tagName)) {
    element.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    const parent = element.parentNode;
    if (!parent) {
      element.remove();
      return;
    }

    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
    return;
  }

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (name.startsWith('on')) {
      element.removeAttribute(attribute.name);
      return;
    }

    const allowedForTag = TAG_ATTRS[tagName];
    const allowed =
      GLOBAL_ATTRS.has(name) ||
      (allowedForTag ? allowedForTag.has(name) : false);

    if (!allowed) {
      element.removeAttribute(attribute.name);
      return;
    }

    if (URL_ATTRS.has(name) && !isSafeUrl(value, tagName)) {
      element.removeAttribute(attribute.name);
      return;
    }

    if (tagName === 'a' && name === 'target' && value === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  });

  Array.from(element.childNodes).forEach((child) => sanitizeNode(child));
}

export function sanitizeRichHtml(rawHtml: string | null | undefined): string {
  const source = String(rawHtml || '').trim();
  if (!source) return '';

  if (typeof document === 'undefined') {
    return escapeHtml(source);
  }

  const doc = document.implementation.createHTMLDocument('sanitized-content');
  doc.body.innerHTML = source;
  Array.from(doc.body.childNodes).forEach((node) => sanitizeNode(node));
  return doc.body.innerHTML;
}
