

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

function parseRGBA(color: string): RGBA {
  const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/i);
  if (!rgba) {
    throw new Error('Invalid color format');
  }
  return {
    r: parseInt(rgba[1]),
    g: parseInt(rgba[2]),
    b: parseInt(rgba[3]),
    a: rgba[4] ? parseFloat(rgba[4]) : 1,
  };
}

function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = parseRGBA(color1);
  const c2 = parseRGBA(color2);

  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  const a = c1.a + factor * (c2.a - c1.a);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function getGradientColor(fromColor: string, toColor: string, steps: number): string[] {
  const gradientColors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    gradientColors.push(interpolateColor(fromColor, toColor, factor));
  }

  return gradientColors;
}
