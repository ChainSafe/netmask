import { parseIPv6 } from "@chainsafe/is-ip/parse";
import { expect } from "chai";
import { cidrMask } from "../src/cidr.js";
import {
  containsIp,
  IpNetRaw,
  iPv4FromIPv6,
  isIPv4mappedIPv6,
} from "../src/ip.js";

describe("ip", function () {
  describe("isIpv4MappedIpv6", function () {
    it("should be true", function () {
      expect(
        isIPv4mappedIPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1, 2, 3])
      ).to.be.true;
    });
    it("should work", function () {
      expect(
        isIPv4mappedIPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 254, 127, 1, 2, 3])
      ).to.be.false;
    });
  });

  describe("ipv4FromIpv6", function () {
    it("should be true", function () {
      expect(
        Array.from(
          iPv4FromIPv6(
            new Uint8Array([
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1, 2, 3,
            ])
          )
        )
      ).to.be.deep.equal([127, 1, 2, 3]);
    });
    it("should throw error", function () {
      expect(() =>
        Array.from(
          iPv4FromIPv6(
            new Uint8Array([
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 254, 127, 1, 2, 3,
            ])
          )
        )
      ).to.throw;
    });
  });

  describe("containsIP", function () {
    const cases: [Uint8Array | number[], IpNetRaw, boolean][] = [
      [
        [172, 16, 1, 1],
        { network: new Uint8Array([172, 16, 0, 0]), mask: cidrMask(12, 32) },
        true,
      ],
      [
        [172, 24, 0, 1],
        { network: new Uint8Array([172, 16, 0, 0]), mask: cidrMask(13, 32) },
        false,
      ],
      [
        [192, 168, 0, 3],
        {
          network: new Uint8Array([192, 168, 0, 0]),
          mask: new Uint8Array([0, 0, 255, 252]),
        },
        true,
      ],
      [
        [192, 168, 0, 4],
        {
          network: new Uint8Array([192, 168, 0, 0]),
          mask: new Uint8Array([0, 255, 0, 252]),
        },
        false,
      ],
      [
        parseIPv6("2001:db8:1:2::1")!,
        { network: parseIPv6("2001:db8:1::")!, mask: cidrMask(47, 128) },
        true,
      ],
      [
        parseIPv6("2001:db8:1:2::1")!,
        { network: parseIPv6("2001:db8:2::")!, mask: cidrMask(47, 128) },
        false,
      ],
      [
        parseIPv6("2001:db8:1:2::1")!,
        {
          network: parseIPv6("2001:db8:1::")!,
          mask: parseIPv6("ffff:0:ffff::")!,
        },
        true,
      ],
      [
        parseIPv6("2001:db8:1:2::1")!,
        {
          network: parseIPv6("2001:db8:1::")!,
          mask: parseIPv6("0:0:0:ffff::")!,
        },
        false,
      ],
    ];

    cases.forEach(([ip, ipNet, result]) => {
      it(`valid case ip=${String(ip)}, net=${String(
        ipNet.network
      )}, mask=${String(ipNet.mask)}`, function () {
        expect(containsIp(ipNet, ip)).to.be.equal(result);
      });
    });
  });
});
