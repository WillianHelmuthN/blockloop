import React from "react";

// ZoneOverlay Props
export interface ZoneOverlayProps {
  w: number;
  h: number;
  inset: number;
  zone: { start: number; end: number };
}

export function ZoneOverlay({ w, h, inset, zone }: ZoneOverlayProps) {
  const W = w - inset * 2;
  const H = h - inset * 2;
  const P = 2 * (W + H);

  function segmentForEdge(
    startT: number,
    endT: number,
    edgeLen: number,
    offsetBefore: number
  ): [number, number] | null {
    function norm(x: number) {
      x = x - Math.floor(x);
      return x * P;
    }
    const sA = norm(startT);
    const sB = norm(endT);
    const intervals: Array<[number, number]> =
      sA <= sB
        ? [[sA, sB]]
        : [
            [sA, P],
            [0, sB],
          ];
    let totalOnEdge: [number, number] | null = null;
    for (const [a, b] of intervals) {
      const a2 = Math.max(a, offsetBefore);
      const b2 = Math.min(b, offsetBefore + edgeLen);
      if (b2 > a2) {
        totalOnEdge = totalOnEdge
          ? [Math.min(totalOnEdge[0], a2), Math.max(totalOnEdge[1], b2)]
          : [a2, b2];
      }
    }
    if (!totalOnEdge) return null;
    return [totalOnEdge[0] - offsetBefore, totalOnEdge[1] - offsetBefore];
  }

  const top = segmentForEdge(zone.start, zone.end, W, 0);
  const right = segmentForEdge(zone.start, zone.end, H, W);
  const bottom = segmentForEdge(zone.start, zone.end, W, W + H);
  const left = segmentForEdge(zone.start, zone.end, H, W + H + W);

  const glow = "0 0 18px 6px rgba(34,197,94,0.35)";
  const edgeStyle: React.CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
  };

  return (
    <>
      <div
        aria-hidden
        style={{
          ...edgeStyle,
          left: inset,
          top: inset - 3,
          width: W,
          height: 6,
          background: top
            ? `linear-gradient(90deg,transparent ${top[0]}px,#22c55e ${top[0]}px,#22c55e ${top[1]}px,transparent ${top[1]}px)`
            : "transparent",
          boxShadow: top ? glow : undefined,
          borderRadius: 999,
        }}
      />
      <div
        aria-hidden
        style={{
          ...edgeStyle,
          left: inset + W - 3,
          top: inset,
          width: 6,
          height: H,
          background: right
            ? `linear-gradient(180deg,transparent ${right[0]}px,#22c55e ${right[0]}px,#22c55e ${right[1]}px,transparent ${right[1]}px)`
            : "transparent",
          boxShadow: right ? glow : undefined,
          borderRadius: 999,
        }}
      />
      <div
        aria-hidden
        style={{
          ...edgeStyle,
          left: inset,
          top: inset + H - 3,
          width: W,
          height: 6,
          background: bottom
            ? `linear-gradient(90deg,transparent ${W - bottom[1]}px,#22c55e ${
                W - bottom[1]
              }px,#22c55e ${W - bottom[0]}px,transparent ${W - bottom[0]}px)`
            : "transparent",
          boxShadow: bottom ? glow : undefined,
          borderRadius: 999,
        }}
      />
      <div
        aria-hidden
        style={{
          ...edgeStyle,
          left: inset - 3,
          top: inset,
          width: 6,
          height: H,
          background: left
            ? `linear-gradient(180deg,transparent ${H - left[1]}px,#22c55e ${
                H - left[1]
              }px,#22c55e ${H - left[0]}px,transparent ${H - left[0]}px)`
            : "transparent",
          boxShadow: left ? glow : undefined,
          borderRadius: 999,
        }}
      />
    </>
  );
}

export default ZoneOverlay;
