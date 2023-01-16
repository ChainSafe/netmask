import { parseIPv4, parseIPv6 } from "@chainsafe/is-ip/parse";
import { expect } from "@esm-bundle/chai";
import { cidrMask, parseCidr } from "../src/cidr.js";
import { maskIp } from "../src/ip.js";

describe("cidr", function () {
  describe("parseCIDR", function () {
    const invalidCidr = [
      "192.168.1.1",
      "192.168.1.1/",
      "/8",
      // "192.168.1.1/255.255.255.0",
      // "192.168.1.1/35",
      // "2001:db8::1/-1",
      // "2001:db8::1/-0",
      // "-0.0.0.0/32",
      // "0.-1.0.0/32",
      // "0.0.-2.0/32",
      // "0.0.0.-3/32",
      // "0.0.0.0/-0",
      // "127.000.000.001/32",
    ];

    invalidCidr.forEach((cidr) => {
      it("invalid cidr - " + cidr, function () {
        expect(() => parseCidr(cidr)).to.throw("Failed to parse given CIDR");
      });
    });
  });

  describe("cidrMask", function () {
    const valid: [number, number, number[]][] = [
      [0, 32, [0, 0, 0, 0]],
      [12, 32, [255, 240, 0, 0]],
      [24, 32, [255, 255, 255, 0]],
      [32, 32, [255, 255, 255, 255]],
      [0, 128, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [4, 128, [0xf0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [
        48,
        128,
        [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [
        128,
        128,
        [
          0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
          0xff, 0xff, 0xff, 0xff, 0xff,
        ],
      ],
    ];

    valid.forEach(([ones, bits, result]) => {
      it(`valid case ones=${String(ones)}, bits=${String(bits)}`, function () {
        expect(Array.from(cidrMask(ones, bits))).to.be.deep.equal(result);
      });
    });

    const invalid = [
      [33, 32],
      [32, 33],
      [-1, 128],
      [128, -1],
    ];

    invalid.forEach(([ones, bits]) => {
      it(`invalid case ones=${String(ones)}, bits=${String(
        bits
      )}`, function () {
        expect(() => cidrMask(ones, bits)).to.throw();
      });
    });
  });

  describe("maskIP", function () {
    const testCases: [Uint8Array, Uint8Array, Uint8Array][] = [
      [
        new Uint8Array([192, 168, 1, 127]),
        new Uint8Array([255, 255, 255, 128]),
        new Uint8Array([192, 168, 1, 0]),
      ],
      [
        new Uint8Array([192, 168, 1, 127]),
        parseIPv4("255.255.255.192")!,
        new Uint8Array([192, 168, 1, 64]),
      ],
      [
        new Uint8Array([192, 168, 1, 127]),
        parseIPv6("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffe0")!,
        new Uint8Array([192, 168, 1, 96]),
      ],
      [
        new Uint8Array([192, 168, 1, 127]),
        new Uint8Array([255, 0, 255, 0]),
        new Uint8Array([192, 0, 1, 0]),
      ],
      [
        parseIPv6("2001:db8::1")!,
        parseIPv6("ffff:ff80::")!,
        parseIPv6("2001:d80::")!,
      ],
      [
        parseIPv6("2001:db8::1")!,
        parseIPv6("f0f0:0f0f::")!,
        parseIPv6("2000:d08::")!,
      ],
    ];

    testCases.forEach(([ip, mask, result]) => {
      it(`valid case ip=${String(ip)}, mask=${String(mask)}`, function () {
        expect(maskIp(ip, mask)).to.be.deep.equal(result);
      });
    });

    const invalid = [
      [33, 32],
      [32, 33],
      [-1, 128],
      [128, -1],
    ];

    invalid.forEach(([ones, bits]) => {
      it(`invalid case ones=${String(ones)}, bits=${String(
        bits
      )}`, function () {
        expect(() => cidrMask(ones, bits)).to.throw();
      });
    });
  });
});
