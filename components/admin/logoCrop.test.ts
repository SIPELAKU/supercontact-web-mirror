import { describe, expect, it } from 'vitest';
import { cropDrawPlan, fitWholeZoom, LOGO_OUTPUT_SIZE } from './logoCrop';

describe('cropDrawPlan (the picked area onto the square upload)', () => {
  it('scales an area inside the picture to the whole square', () => {
    expect(cropDrawPlan({ x: 100, y: 50, width: 256, height: 256 }, { width: 800, height: 600 })).toEqual({
      sx: 100, sy: 50, sw: 256, sh: 256, dx: 0, dy: 0, dw: LOGO_OUTPUT_SIZE, dh: LOGO_OUTPUT_SIZE,
    });
  });

  it('zoomed out on a wide logo: the whole picture, centred, the rest transparent', () => {
    // 1000 x 250 logo in a 1000 x 1000 area starting 375 above it.
    const plan = cropDrawPlan({ x: 0, y: -375, width: 1000, height: 1000 }, { width: 1000, height: 250 });
    expect(plan).toEqual({ sx: 0, sy: 0, sw: 1000, sh: 250, dx: 0, dy: 192, dw: 512, dh: 128 });
  });

  it('only draws the part of the picture inside an area that hangs off one edge', () => {
    const plan = cropDrawPlan({ x: -100, y: 0, width: 400, height: 400 }, { width: 300, height: 500 });
    expect(plan).toEqual({ sx: 0, sy: 0, sw: 300, sh: 400, dx: 128, dy: 0, dw: 384, dh: 512 });
  });

  it('draws nothing when the area misses the picture', () => {
    expect(cropDrawPlan({ x: 900, y: 0, width: 100, height: 100 }, { width: 800, height: 600 })).toBeNull();
  });
});

describe('fitWholeZoom', () => {
  it('is 1 for a square picture and shrinks for a long one', () => {
    expect(fitWholeZoom(500, 500)).toBe(1);
    expect(fitWholeZoom(1000, 250)).toBe(0.25);
    expect(fitWholeZoom(300, 600)).toBe(0.5);
  });

  it('is 1 when the size is unknown', () => {
    expect(fitWholeZoom(0, 0)).toBe(1);
  });
});
