import { expect } from "chai";
import { cidrMask, IPNet } from "../src/cidr.js";
import {
  containsIp,
  IPv4,
  iPv4FromIPv6,
  IPv6,
  isIPv4mappedIPv6,
  parseIP,
  parseIPv4,
  parseIPv6,
} from "../src/ip.js";

describe("ip", function () {
  describe("parseIpv4", function () {
    const invalidIpv4 = [
      "",
      "0",
      "-0.0.0.0",
      "0.-1.0.0",
      "0.0.-2.0",
      "0.0.%2.0",
      "0.0.0.-3",
      "127.0.0.256",
      "abc",
      "123:",
      "127.001.002.003",
      "123.000.000.000",
      "1.2..4",
      "0123.0.0.1",
    ];
    invalidIpv4.forEach((ip) => {
      it("invalid IPv4 - " + ip, function () {
        expect(parseIPv4(ip)).to.be.null;
      });
    });
    const validIpv4: [string, IPv4][] = [
      ["127.0.1.2", [127, 0, 1, 2]],
      ["127.0.0.1", [127, 0, 0, 1]],
      ["0.0.0.0", [0, 0, 0, 0]],
      ["255.255.255.255", [255, 255, 255, 255]],
    ];
    validIpv4.forEach(([ip, result]) => {
      it("valid IPv4 - " + ip, function () {
        expect(parseIPv4(ip)).to.deep.equal(result);
      });
    });
  });

  describe("parseIpv6", function () {
    const invalidIpv6 = [
      "",
      "abc",
      "127.0.0.256",
      "127.0.0.254",
      "fe80::1%lo0",
      "fe80::1%911",
      "a1:a2:a3:a4::b1:b2:b3:b4",
      "127.001.002.003",
      "::ffff:127.001.002.003",
      "::ffff:127.001.002.003",
      "2001::0:2001::68",
    ];
    invalidIpv6.forEach((ip) => {
      it("invalid IPv6 - " + ip, function () {
        expect(parseIPv6(ip)).to.be.null;
      });
    });
    const validIpv6: [string, IPv6][] = [
      [
        "::ffff:127.1.2.3",
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1, 2, 3],
      ],
      [
        "::ffff:7f01:0203",
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1, 2, 3],
      ],
      [
        "0:0:0:0:0000:ffff:127.1.2.3",
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1, 2, 3],
      ],
      [
        "0:0:0:0:000000:ffff:127.1.2.3",
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1, 2, 3],
      ],
      [
        "0:0:0:0::ffff:127.1.2.3",
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1, 2, 3],
      ],
      [
        "2001:4860:0:2001::68",
        [
          0x20, 0x01, 0x48, 0x60, 0, 0, 0x20, 0x01, 0, 0, 0, 0, 0, 0, 0x00,
          0x68,
        ],
      ],
      [
        "2001:4860:0000:2001:0000:0000:0000:0068",
        [
          0x20, 0x01, 0x48, 0x60, 0, 0, 0x20, 0x01, 0, 0, 0, 0, 0, 0, 0x00,
          0x68,
        ],
      ],
    ];
    validIpv6.forEach(([ip, result]) => {
      it("valid IPv6 - " + ip, function () {
        expect(parseIPv6(ip)).to.deep.equal(result);
      });
    });
  });

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
        iPv4FromIPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1, 2, 3])
      ).to.be.deep.equal([127, 1, 2, 3]);
    });
    it("should throw error", function () {
      expect(() =>
        iPv4FromIPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 254, 127, 1, 2, 3])
      ).to.throw;
    });
  });

  describe("parseIP", function () {
    it("should parse IPv4", function () {
      expect(parseIP("127.1.2.3")).to.be.deep.equal([127, 1, 2, 3]);
    });
    it("should parse IPv6", function () {
      expect(
        parseIP("2001:4860:0000:2001:0000:0000:0000:0068")
      ).to.be.deep.equal([
        0x20, 0x01, 0x48, 0x60, 0, 0, 0x20, 0x01, 0, 0, 0, 0, 0, 0, 0x00, 0x68,
      ]);
    });
    it("should return null", function () {
      expect(parseIP("")).to.be.null;
    });
  });

  describe("containsIP", function () {
    const cases: [IPv4 | IPv6, IPNet, boolean][] = [
      [[172, 16, 1, 1], { net: [172, 16, 0, 0], mask: cidrMask(12, 32) }, true],
      [
        [172, 24, 0, 1],
        { net: [172, 16, 0, 0], mask: cidrMask(13, 32) },
        false,
      ],
      [
        [192, 168, 0, 3],
        { net: [192, 168, 0, 0], mask: [0, 0, 255, 252] },
        true,
      ],
      [
        [192, 168, 0, 4],
        { net: [192, 168, 0, 0], mask: [0, 255, 0, 252] },
        false,
      ],
      [
        parseIPv6("2001:db8:1:2::1")!,
        { net: parseIPv6("2001:db8:1::")!, mask: cidrMask(47, 128) },
        true,
      ],
      [
        parseIPv6("2001:db8:1:2::1")!,
        { net: parseIPv6("2001:db8:2::")!, mask: cidrMask(47, 128) },
        false,
      ],
      [
        parseIPv6("2001:db8:1:2::1")!,
        { net: parseIPv6("2001:db8:1::")!, mask: parseIPv6("ffff:0:ffff::")! },
        true,
      ],
      [
        parseIPv6("2001:db8:1:2::1")!,
        { net: parseIPv6("2001:db8:1::")!, mask: parseIPv6("0:0:0:ffff::")! },
        false,
      ],
    ];

    cases.forEach(([ip, ipNet, result]) => {
      it(`valid case ip=${String(ip)}, net=${String(ipNet.net)}, mask=${String(
        ipNet.mask
      )}`, function () {
        expect(containsIp(ipNet, ip)).to.be.equal(result);
      });
    });
  });
});
