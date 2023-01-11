import { parseCidr } from "./cidr.js";
import { containsIp, parseIP } from "./ip.js";

export {
  parseIP,
  parseIPv4,
  parseIPv6,
  maskIp,
  iPv4FromIPv6,
  isIPv4mappedIPv6,
} from "./ip.js";
export type { IPv4, IPv6 } from "./ip.js";
export type { IPNet, Mask } from "./cidr.js";
export { parseCidr } from "./cidr.js";

/**
 * Checks if cidr block contains ip address
 * @param cidr ipv4 or ipv6 formatted cidr . Example 198.51.100.14/24 or 2001:db8::/48
 * @param ip ipv4 or ipv6 address Example 198.51.100.14 or 2001:db8::
 *
 */
export function cidrContains(cidr: string, ip: string): boolean {
  const netIP = parseCidr(cidr);
  const parsedIP = parseIP(ip);
  if (parsedIP == null) {
    throw new Error("Invalid ip");
  }
  return containsIp(netIP, parsedIP);
}
/**
 * Checks if network with given mask contains IP
 * @param cidr ipv4 or ipv6 formatted cidr . Example 198.51.100.14/24 or 2001:db8::/48
 * @param ip ipv4 or ipv6 address Example 198.51.100.14 or 2001:db8::
 *
 */
export function networkMaskContains(
  networkIp: string,
  mask: string,
  ip: string
): boolean {
  const parsedNetwork = parseIP(networkIp);
  const parsedMask = parseIP(mask);
  const parsedIP = parseIP(ip);
  if (parsedIP == null || parsedNetwork == null || parsedMask == null) {
    throw new Error("Invalid parameters");
  }
  return containsIp(
    {
      net: parsedNetwork,
      mask: parsedMask,
    },
    parsedIP
  );
}
