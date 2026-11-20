// components/pipeline/stage-editor/colorMath.ts
//
// Colour maths for the colour wheel: hue goes round the wheel (0° at the top,
// clockwise, as CSS conic-gradient draws it), saturation from the centre
// (white) to the rim, and the brightness slider sets the value.

export interface Hsv {
  /** 0-360 */
  h: number;
  /** 0-1 */
  s: number;
  /** 0-1 */
  v: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const toHex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0").toUpperCase();

export function hsvToHex({ h, s, v }: Hsv): string {
  const hue = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return `#${toHex2((r + m) * 255)}${toHex2((g + m) * 255)}${toHex2((b + m) * 255)}`;
}

/** "#RRGGBB" -> HSV; black for anything else. */
export function hexToHsv(hex: string): Hsv {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return { h: 0, s: 0, v: 0 };
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return { h: (h + 360) % 360, s: max ? d / max : 0, v: max };
}

/** A point on the wheel (relative to its centre, y down) -> hue and
 *  saturation. Outside the rim counts as the rim. */
export function wheelPointToHs(dx: number, dy: number, radius: number): { h: number; s: number } {
  const h = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  return { h, s: radius > 0 ? clamp(Math.hypot(dx, dy) / radius, 0, 1) : 0 };
}

/** Where the marker sits for a hue and saturation (relative to the centre). */
export function hsToWheelPoint(h: number, s: number, radius: number): { x: number; y: number } {
  const angle = (h * Math.PI) / 180;
  return { x: Math.sin(angle) * s * radius, y: -Math.cos(angle) * s * radius };
}
