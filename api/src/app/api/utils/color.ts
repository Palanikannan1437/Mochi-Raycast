// import { createCanvas } from "canvas"

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


export function getChartColorConfig(id?: string) {
  let gradientFrom, gradientTo, borderColor
  switch (id) {
    case "bitcoin":
      borderColor = "#ffa301"
      gradientFrom = "rgba(159,110,43,0.9)"
      gradientTo = "rgba(76,66,52,0.5)"
      break
    case "ethereum":
    case "ethereum-pow-iou":
      borderColor = "#a996f2"
      gradientFrom = "rgba(108,136,217,0.9)"
      gradientTo = "rgba(74,93,148,0.5)"
      break
    case "tether":
      borderColor = "#22a07a"
      gradientFrom = "rgba(46,78,71,0.9)"
      gradientTo = "rgba(48,63,63,0.5)"
      break
    case "binancecoin" || "terra":
      borderColor = "#f5bc00"
      gradientFrom = "rgba(172,136,41,0.9)"
      gradientTo = "rgba(73,67,55,0.5)"
      break
    case "solana":
      borderColor = "#9945ff"
      gradientFrom = "rgba(116,62,184,0.9)"
      gradientTo = "rgba(61,53,83,0.5)"
      break
    default:
      borderColor = "#9945ff"
      gradientFrom = "rgba(53,83,192,0.9)"
      gradientTo = "rgba(58,69,110,0.5)"
  }

  return {
    borderColor,
    backgroundColor: getGradientColor(gradientFrom, gradientTo, 4),
  }
}

// export function getGradientColor1(
//   fromColor: string,
//   toColor: string
// ): CanvasGradient {
//   const canvas = createCanvas(100, 100)
//   const ctx = canvas.getContext("2d")
//   const backgroundColor = ctx.createLinearGradient(0, 0, 0, 400)
//   backgroundColor.addColorStop(0, fromColor)
//   backgroundColor.addColorStop(1, toColor)
//   return backgroundColor
// }

