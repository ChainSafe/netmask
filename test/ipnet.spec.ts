import { expect } from "chai";
import { IpNet } from "../src/ipnet.js";

describe("ipnet", function () {
  describe("constructor", function () {
    it("should fail on invalid mask", function () {
      expect(() => new IpNet("192.168.0.1", "a")).to.throw(
        "Failed to parse mask"
      );
    });
    it("should fail on invalid mask", function () {
      expect(() => new IpNet("192.168.0.1", "255.255.a.0")).to.throw(
        "Failed to parse mask"
      );
    });
    it("should fail on invalid network", function () {
      expect(() => new IpNet("192.168.0.a", "12")).to.throw(
        "Failed to parse network"
      );
    });
    it("should work with cidr", function () {
      expect(() => new IpNet("192.168.0.0/12")).to.not.throw();
    });
    it("should work with network and mask", function () {
      expect(() => new IpNet("192.168.0.0", "12")).to.not.throw();
    });
    it("should work with network and mask", function () {
      expect(() => new IpNet("192.168.0.0", 12)).to.not.throw();
    });
    it("should work with network and ip mask", function () {
      expect(() => new IpNet("192.168.0.0", "255.0.0.0")).to.not.throw();
    });
  });

  describe("toString", function () {
    const cases = [
      "192.168.1.0/26",
      "2001:0db8:0000:0000:0000:0000:0000:0000/55",
    ];

    cases.forEach((cidr) => {
      it(`serialize - deserialize ${cidr}`, function () {
        expect(new IpNet(cidr).toString()).to.be.equal(cidr);
      });
    });
  });
  describe("contains", function () {
    const cases: [string, string, boolean][] = [
      ["172.16.1.1", "172.16.0.0/12", true],
      ["2001:db8:1:2::1", "2001:db8:1::/47", true],
      ["2001:db8:1:2::1", "2001:db8:2::/47", false],
    ];

    cases.forEach(([ip, cidr, result]) => {
      it(`contains cidr=${cidr} ip=${ip} result=${String(
        result
      )}`, function () {
        expect(new IpNet(cidr).contains(ip)).to.be.equal(result);
      });
    });
  });
});
