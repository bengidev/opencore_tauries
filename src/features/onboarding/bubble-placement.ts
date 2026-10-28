export const BUBBLE_GAP = 18;
export const BUBBLE_EDGE_PAD = 10;

export type BubbleRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type BubblePlacement = {
  left: number;
  top: number;
  tailX: number;
  placement: "above" | "below";
  visible: boolean;
};

export function placeBubble({
  headX,
  headY,
  stageWidth,
  stageHeight,
  bubbleWidth,
  bubbleHeight,
  gap = BUBBLE_GAP,
  edgePad = BUBBLE_EDGE_PAD,
  safeTop = edgePad,
  avoid = null,
  avoidPad = 0,
}: {
  headX: number;
  headY: number;
  stageWidth: number;
  stageHeight: number;
  bubbleWidth: number;
  bubbleHeight: number;
  gap?: number;
  edgePad?: number;
  safeTop?: number;
  avoid?: BubbleRect | null;
  avoidPad?: number;
}): BubblePlacement {
  const headVisible =
    headX >= -120 &&
    headX <= stageWidth + 120 &&
    headY >= -120 &&
    headY <= stageHeight + 120;

  const maxLeft = Math.max(edgePad, stageWidth - bubbleWidth - edgePad);
  const left = Math.max(edgePad, Math.min(headX - bubbleWidth / 2, maxLeft));
  const bottomLimit = stageHeight - bubbleHeight - edgePad;
  const aboveTop = headY - gap - bubbleHeight;
  const belowTop = headY + gap;
  const fitsAbove = aboveTop >= safeTop && aboveTop <= bottomLimit;
  const fitsBelow = belowTop >= safeTop && belowTop <= bottomLimit;

  const overlapsAvoid = (top: number) =>
    avoid !== null &&
    left < avoid.right + avoidPad &&
    left + bubbleWidth > avoid.left - avoidPad &&
    top < avoid.bottom + avoidPad &&
    top + bubbleHeight > avoid.top - avoidPad;

  let placement: BubblePlacement["placement"] = fitsAbove ? "above" : "below";
  let top = fitsAbove ? aboveTop : belowTop;

  if (overlapsAvoid(top)) {
    const alternate = placement === "above" ? "below" : "above";
    const alternateTop = alternate === "above" ? aboveTop : belowTop;
    const alternateFits = alternate === "above" ? fitsAbove : fitsBelow;
    if (alternateFits && !overlapsAvoid(alternateTop)) {
      placement = alternate;
      top = alternateTop;
    }
  }

  const visible = headVisible && (fitsAbove || fitsBelow) && !overlapsAvoid(top);
  top = Math.max(safeTop, Math.min(top, bottomLimit));

  return {
    left,
    top,
    tailX: Math.max(14, Math.min(headX - left, bubbleWidth - 14)),
    placement,
    visible,
  };
}
