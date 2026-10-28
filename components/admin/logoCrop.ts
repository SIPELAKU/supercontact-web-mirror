// Turning the area picked in the "Adjust logo" dialog into the square image
// that is uploaded. The area may reach past the picture (zoomed out so a wide
// logo fits whole); that part stays transparent.

/** Side of the square image uploaded, in pixels. */
export const LOGO_OUTPUT_SIZE = 512;

export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DrawPlan {
  /** The part of the picture inside the area. */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** Where it goes on the square canvas. */
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/**
 * What to draw on a `size` x `size` canvas for a square `area` of a picture
 * of `image` size. null = the area misses the picture (an empty image).
 */
export function cropDrawPlan(
  area: PixelArea,
  image: { width: number; height: number },
  size = LOGO_OUTPUT_SIZE
): DrawPlan | null {
  const sx = Math.max(0, area.x);
  const sy = Math.max(0, area.y);
  const sw = Math.min(image.width, area.x + area.width) - sx;
  const sh = Math.min(image.height, area.y + area.height) - sy;
  if (sw <= 0 || sh <= 0 || area.width <= 0) return null;

  const scale = size / area.width;
  return { sx, sy, sw, sh, dx: (sx - area.x) * scale, dy: (sy - area.y) * scale, dw: sw * scale, dh: sh * scale };
}

/** The zoom at which a whole picture fits the square frame (1 for a square one). */
export function fitWholeZoom(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 1;
  return Math.min(width, height) / Math.max(width, height);
}

/** The cropped logo as a PNG file (keeps transparency), named after the original. */
export async function cropLogoImage(src: string, area: PixelArea, originalName: string): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The image could not be read."));
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = LOGO_OUTPUT_SIZE;
  canvas.height = LOGO_OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The image could not be prepared.");
  context.imageSmoothingQuality = "high";

  const plan = cropDrawPlan(area, { width: image.naturalWidth, height: image.naturalHeight });
  if (plan) {
    context.drawImage(image, plan.sx, plan.sy, plan.sw, plan.sh, plan.dx, plan.dy, plan.dw, plan.dh);
  }

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("The image could not be prepared."))), "image/png")
  );
  const baseName = originalName.replace(/\.[^.]+$/, "") || "logo";
  return new File([blob], `${baseName}.png`, { type: "image/png" });
}
