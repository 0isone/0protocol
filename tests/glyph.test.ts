import { describe, it, expect } from 'vitest';
import { renderGlyph } from '../src/render/glyph';

describe('renderGlyph', () => {
  const validData = '0123456789'.repeat(10);

  it('returns svg and url', () => {
    const result = renderGlyph(validData);
    expect(result).toHaveProperty('svg');
    expect(result).toHaveProperty('url');
  });

  it('produces valid SVG', () => {
    const { svg } = renderGlyph(validData);
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 32 32"');
    expect(svg).toContain('</svg>');
  });

  it('renders 100 cells (10x10 grid)', () => {
    const { svg } = renderGlyph(validData);
    // Count rect elements (1 background + 100 cells)
    const rectCount = (svg.match(/<rect/g) || []).length;
    expect(rectCount).toBe(101); // 1 background + 100 cells
  });

  it('maps digit 0 to opacity 0', () => {
    const allZeros = '0'.repeat(100);
    const { svg } = renderGlyph(allZeros);
    expect(svg).toContain('opacity="0"');
  });

  it('maps digit 9 to opacity 1', () => {
    const allNines = '9'.repeat(100);
    const { svg } = renderGlyph(allNines);
    expect(svg).toContain('opacity="1"');
  });

  it('maps digit 5 to correct opacity', () => {
    const data = '5' + '0'.repeat(99);
    const { svg } = renderGlyph(data);
    // 5/9 ≈ 0.5556
    expect(svg).toContain(`opacity="${5 / 9}"`);
  });

  it('produces URL with hash prefix', () => {
    const { url } = renderGlyph(validData);
    expect(url).toMatch(/^https:\/\/mcp\.0protocol\.dev\/glyph\/[0-9a-f]{16}\.svg$/);
  });

  it('produces deterministic output', () => {
    const r1 = renderGlyph(validData);
    const r2 = renderGlyph(validData);
    expect(r1.svg).toBe(r2.svg);
    expect(r1.url).toBe(r2.url);
  });

  it('produces different output for different data', () => {
    const data2 = '9876543210'.repeat(10);
    const r1 = renderGlyph(validData);
    const r2 = renderGlyph(data2);
    expect(r1.svg).not.toBe(r2.svg);
  });

  it('cell positions form 32x32 grid with 1px border', () => {
    const { svg } = renderGlyph(validData);
    // First cell should be at x=1, y=1 (1px border)
    expect(svg).toContain('x="1" y="1"');
    // Last cell (row 9, col 9) should be at x=28, y=28
    expect(svg).toContain('x="28" y="28"');
  });

  it('each cell is 3x3 pixels', () => {
    const { svg } = renderGlyph(validData);
    // All cells should have width="3" height="3"
    const cellRects = svg.match(/width="3" height="3"/g) || [];
    expect(cellRects.length).toBe(100);
  });
});
