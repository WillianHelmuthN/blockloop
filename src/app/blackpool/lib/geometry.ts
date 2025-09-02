export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function randRange(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function tToXY(
  t: number,
  w: number,
  h: number,
  inset: number
): { x: number; y: number } {
  const W = w - inset * 2;
  const H = h - inset * 2;
  const P = 2 * (W + H);
  let s = (t - Math.floor(t)) * P;
  if (s <= W) return { x: inset + s, y: inset };
  s -= W;
  if (s <= H) return { x: inset + W, y: inset + s };
  s -= H;
  if (s <= W) return { x: inset + W - s, y: inset + H };
  s -= W;
  return { x: inset, y: inset + H - s };
}

export function isHit(t: number, start: number, end: number): boolean {
  t = t - Math.floor(t);
  start = start - Math.floor(start);
  end = end - Math.floor(end);
  if (start <= end) return t >= start && t <= end;
  return t >= start || t <= end;
}
