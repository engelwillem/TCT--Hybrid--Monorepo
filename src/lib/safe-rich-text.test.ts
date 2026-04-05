import { describe, expect, it } from 'vitest';
import { sanitizeRichHtml } from './safe-rich-text';

describe('sanitizeRichHtml', () => {
  it('removes scripts and inline event handlers', () => {
    const html = '<p onclick="alert(1)">Halo</p><script>alert(1)</script>';
    const sanitized = sanitizeRichHtml(html);

    expect(sanitized).toContain('<p>Halo</p>');
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('<script');
  });

  it('drops javascript urls and preserves safe links', () => {
    const html = '<a href="javascript:alert(1)" target="_blank">Bad</a><a href="/renungan">Good</a>';
    const sanitized = sanitizeRichHtml(html);

    expect(sanitized).toContain('<a target="_blank" rel="noopener noreferrer">Bad</a>');
    expect(sanitized).toContain('<a href="/renungan">Good</a>');
    expect(sanitized).not.toContain('javascript:alert');
  });

  it('unwraps unsupported tags but keeps inner text', () => {
    const html = '<custom-tag><strong>Aman</strong> dan teks</custom-tag>';
    const sanitized = sanitizeRichHtml(html);

    expect(sanitized).toContain('<strong>Aman</strong> dan teks');
    expect(sanitized).not.toContain('custom-tag');
  });

  it('allows safe image sources and strips unsafe ones', () => {
    const html = '<img src="https://cdn.example.com/a.jpg" alt="ok"><img src="javascript:alert(1)" alt="bad">';
    const sanitized = sanitizeRichHtml(html);

    expect(sanitized).toContain('<img src="https://cdn.example.com/a.jpg" alt="ok">');
    expect(sanitized).toContain('<img alt="bad">');
    expect(sanitized).not.toContain('javascript:alert');
  });
});
