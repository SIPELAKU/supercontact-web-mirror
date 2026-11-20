import { describe, expect, it } from "vitest";
import { hexToHsv, hsToWheelPoint, hsvToHex, wheelPointToHs } from "./colorMath";

describe("hsv <-> hex", () => {
  it("primary colours", () => {
    expect(hsvToHex({ h: 0, s: 1, v: 1 })).toBe("#FF0000");
    expect(hsvToHex({ h: 120, s: 1, v: 1 })).toBe("#00FF00");
    expect(hsvToHex({ h: 240, s: 1, v: 1 })).toBe("#0000FF");
    expect(hsvToHex({ h: 360, s: 1, v: 1 })).toBe("#FF0000");
  });

  it("white, black, grey", () => {
    expect(hsvToHex({ h: 200, s: 0, v: 1 })).toBe("#FFFFFF");
    expect(hsvToHex({ h: 200, s: 1, v: 0 })).toBe("#000000");
    expect(hexToHsv("#808080")).toMatchObject({ s: 0 });
  });

  it("round-trips the palette", () => {
    for (const hex of ["#26C6F9", "#FDB528", "#72E128", "#6D788D", "#666CFF", "#EF4444", "#EC4899", "#14B8A6"]) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    }
  });

  it("anything that is not #RRGGBB is black", () => {
    expect(hexToHsv("red")).toEqual({ h: 0, s: 0, v: 0 });
  });
});

describe("wheel", () => {
  it("hue clockwise from the top, saturation from the centre", () => {
    expect(wheelPointToHs(0, -50, 100)).toEqual({ h: 0, s: 0.5 });
    expect(wheelPointToHs(100, 0, 100)).toEqual({ h: 90, s: 1 });
    expect(wheelPointToHs(0, 100, 100).h).toBeCloseTo(180);
    expect(wheelPointToHs(-100, 0, 100).h).toBeCloseTo(270);
  });

  it("outside the rim is the rim; the centre is white", () => {
    expect(wheelPointToHs(300, 0, 100).s).toBe(1);
    expect(wheelPointToHs(0, 0, 100).s).toBe(0);
  });

  it("the marker lands where the point was", () => {
    const { h, s } = wheelPointToHs(30, 40, 100);
    const { x, y } = hsToWheelPoint(h, s, 100);
    expect(x).toBeCloseTo(30);
    expect(y).toBeCloseTo(40);
  });
});
