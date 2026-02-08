import { sha256hex } from '../core/crypto';

export function renderGlyph(data: string): { svg: string; url: string } {
  // 10×10 grid, each cell 3×3 pixels, 1px border = 32×32
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">';
  svg += '<rect width="32" height="32" fill="white"/>';

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const idx = row * 10 + col;
      const value = parseInt(data[idx]);
      const opacity = value / 9;

      const x = 1 + col * 3;
      const y = 1 + row * 3;

      svg += `<rect x="${x}" y="${y}" width="3" height="3" fill="black" opacity="${opacity}"/>`;
    }
  }

  svg += '</svg>';

  const hash = sha256hex(data).slice(0, 16);
  const url = `https://mcp.0protocol.dev/glyph/${hash}.svg`;

  return { svg, url };
}
