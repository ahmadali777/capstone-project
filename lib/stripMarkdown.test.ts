import { describe, expect, it } from 'vitest';
import { stripMarkdown } from './stripMarkdown';

describe('stripMarkdown', () => {
  it('removes bold, italic, and strikethrough markers', () => {
    expect(stripMarkdown('**bold** *italic* ~~gone~~')).toBe('bold italic gone');
  });

  it('removes inline code and fenced code blocks', () => {
    expect(stripMarkdown('`code` and ```js\nconst x = 1;\n```')).toBe('code and const x = 1;');
  });

  it('removes headings, lists, and blockquotes', () => {
    const input = '# Heading\n- item one\n- item two\n> quote';
    expect(stripMarkdown(input)).toBe('Heading\nitem one\nitem two\nquote');
  });

  it('turns links into their display text', () => {
    expect(stripMarkdown('[open site](https://example.com)')).toBe('open site');
  });

  it('collapses triple newlines and trims whitespace', () => {
    expect(stripMarkdown('a\n\n\n\nb\n\n')).toBe('a\n\nb');
  });
});
