export function allFF(a: number[], from: number, to: number): boolean {
  let i = 0;
  for (const e of a) {
    if (i < from) continue;
    if (i > to) break;
    if (e !== 0xff) return false;
    i++;
  }
  return true;
}

export function deepEqual(
  a: number[],
  b: number[],
  from: number,
  to: number
): boolean {
  let i = 0;
  for (const e of a) {
    if (i < from) continue;
    if (i > to) break;
    if (e !== b[i]) return false;
    i++;
  }
  return true;
}
