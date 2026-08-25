import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

export function sx(...styles: Array<StyleXStyles | false | null | undefined>): string {
  const attrs = stylex.attrs(...styles);
  let out = '';
  if (attrs.class) {
    out += ` class="${attrs.class}"`;
  }
  if (attrs.style) {
    out += ` style="${escapeAttr(attrs.style)}"`;
  }
  return out;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

export function externalAttrs(href: string): string {
  return href.startsWith('http')
    ? ' target="_blank" rel="noopener noreferrer"'
    : '';
}
