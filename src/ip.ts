import type { IPNet, Mask } from "./cidr.js";
import { allFF, deepEqual } from "./util.js";

export const IPv4Len = 4;
export const IPv6Len = 16;

export const maxIPv6Octet = parseInt("0xFFFF", 16);
export const ipv4Prefix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255];

export type IPv4 = [number, number, number, number];
export type IPv6 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export function maskIp(ip: IPv4 | IPv6, mask: Mask): IPv4 | IPv6 {
  if (mask.length === IPv6Len && ip.length === IPv4Len && allFF(mask, 0, 11)) {
    mask = mask.slice(12);
  }
  if (
    mask.length === IPv4Len &&
    ip.length === IPv6Len &&
    deepEqual(ip, ipv4Prefix, 0, 11)
  ) {
    ip = ip.slice(12) as IPv4;
  }
  const n = ip.length;
  if (n != mask.length) {
    throw new Error("Failed to mask ip");
  }
  const out = new Array<number>(n).fill(0) as IPv4 | IPv6;
  for (let i = 0; i < n; i++) {
    out[i] = ip[i] & mask[i];
  }
  return out;
}

export function containsIp(net: IPNet, ip: IPv4 | IPv6 | string): boolean {
  if (typeof ip === "string") {
    ip = parseIP(ip)!;
  }
  if (ip == null) throw new Error("Invalid ip");
  if (ip.length !== net.net.length) {
    return false;
  }
  for (let i = 0; i < ip.length; i++) {
    if ((net.net[i] & net.mask[i]) !== (ip[i] & net.mask[i])) {
      return false;
    }
  }
  return true;
}

export function parseIP(s: string): IPv4 | IPv6 | null {
  for (let i = 0; i < s.length; i++) {
    switch (s[i]) {
      case ".":
        return parseIPv4(s);
      case ":":
        return parseIPv6(s);
    }
  }
  return null;
}

export function isIPv4mappedIPv6(ip: IPv6): boolean {
  for (let i = 0; i < IPv6Len - IPv4Len; i++) {
    if (ip[i] !== ipv4Prefix[i]) return false;
  }
  return true;
}

export function iPv4FromIPv6(ip: IPv6): IPv4 {
  if (!isIPv4mappedIPv6(ip)) {
    throw new Error("Not a ipv4 mapped ipv6 address");
  }
  return [ip[12], ip[13], ip[14], ip[15]];
}

/**
 * Parses IPv4 address, returns ip address or null if invalid
 */
export function parseIPv4(s: string): IPv4 | null {
  const ip: IPv4 = [0, 0, 0, 0];
  if (s.length === 0) return null;
  const parts = s.split(".");
  if (parts.length < IPv4Len) return null;
  for (let i = 0; i < IPv4Len; i++) {
    const part = parts[i];
    if (part.startsWith("-")) return null;
    const p = parseInt(parts[i], 10);
    if (Number.isNaN(p)) return null;
    if (p === 0 && part.length > 1) return null;
    if (p < 0 || p > 255) return null;
    if (p > 1 && parts[i].startsWith("0")) {
      return null;
    }
    ip[i] = p;
  }
  return ip;
}

/**
 * parseIPv6 parses s as a literal IPv6 address described in RFC 4291
 * and RFC 5952. Returns either IPV6 address or null if invalid
 */
export function parseIPv6(s: string): IPv6 | null {
  const ipv6: IPv6 = new Array<number>(16).fill(0) as IPv6;
  let elipsis = -1;
  if (s.length > 2 && s[0] === ":" && s[1] === ":") {
    elipsis = 0;
    s = s.slice(2);
    if (s.length === 0) {
      return ipv6;
    }
  }
  let i = 0;
  while (i < IPv6Len) {
    let colonIndex = s.indexOf(":");
    let dotIndex = s.indexOf(".");
    colonIndex = colonIndex == -1 ? Infinity : colonIndex;
    dotIndex = dotIndex == -1 ? Infinity : dotIndex;
    const part = s.slice(0, Math.min(colonIndex, dotIndex));
    if (!part.match(/^[A-Fa-f0-9]*$/)) return null;
    //parse hex
    const p = parseInt(part, 16);
    if (Number.isNaN(p) || p < 0 || p > maxIPv6Octet) return null;
    // If followed by dot, might be in trailing IPv4.
    if (s[part.length] === ".") {
      if (elipsis < 0 && i != IPv6Len - IPv4Len) {
        //not the right place
        return null;
      }
      if (i + IPv4Len > IPv6Len) {
        // Not enough room.
        return null;
      }
      const ip4 = parseIPv4(s);
      if (ip4 == null) return null;
      ipv6[i] = ip4[0];
      ipv6[i + 1] = ip4[1];
      ipv6[i + 2] = ip4[2];
      ipv6[i + 3] = ip4[3];
      s = "";
      i += IPv4Len;
      break;
    }
    ipv6[i] = p >> 8;
    ipv6[i + 1] = p & 0xff;
    i += 2;
    s = s.slice(part.length);
    if (s.length === 0) break;
    if (s[0] !== ":" || s.length === 1) {
      return null;
    }
    s = s.slice(1);
    if (s[0] === ":") {
      if (elipsis >= 0) return null;
      elipsis = i;
      s = s.slice(1);
      if (s.length === 0) break;
    }
  }
  if (s.length !== 0) {
    return null;
  }
  // If didn't parse enough, expand ellipsis.
  if (i < IPv6Len) {
    if (elipsis < 0) {
      return null;
    }
    const n = IPv6Len - i;
    for (let j = i - 1; j >= elipsis; j--) {
      ipv6[j + n] = ipv6[j];
    }
    for (let j = elipsis + n - 1; j >= elipsis; j--) {
      ipv6[j] = 0;
    }
  } else if (elipsis >= 0) {
    // Ellipsis must represent at least one 0 group.
    return null;
  }
  return ipv6;
}
