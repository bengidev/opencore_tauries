export function findInkTop(pixels: Uint8ClampedArray, width: number, height: number): number | null {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] > 16) return y;
    }
  }
  return null;
}

export function getBubbleBottomOffset({
  figureBottom,
  heroTop,
  gap,
  tailDepth,
}: {
  figureBottom: number;
  heroTop: number;
  gap: number;
  tailDepth: number;
}): number {
  return figureBottom - heroTop + gap + tailDepth;
}
