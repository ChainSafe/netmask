import { expect } from "chai";
import { cidrContains, networkMaskContains } from "../src/index.js";

describe("exported methods", function () {
  describe("cidrContains", function () {
    it("should work", function () {
      expect(cidrContains("192.168.0.1/24", "192.168.0.16")).to.be.true;
      expect(cidrContains("2001:db8::/128", "2001:db8::")).to.be.true;
      expect(cidrContains("2001:db8::/128", "2001:db99::")).to.be.false;
    });
    it("should error - invalid cidr", function () {
      expect(() => cidrContains("192.168.0.1", "192.168.0.16")).to.throw();
    });
    it("should error - invalid ip", function () {
      expect(() => cidrContains("192.168.0.1/24", "192.168.0")).to.throw();
    });
  });
  describe("networkMaskContains", function () {
    it("should work", function () {
      expect(
        networkMaskContains("192.168.0.1/24", "255.255.255.0", "192.168.0.16")
      ).to.be.true;
    });
    it("should error - invalid network ip", function () {
      expect(() =>
        networkMaskContains("192.168.0.-1", "255.0.0.0", "192.168.0.16")
      ).to.throw();
    });
    it("should error - invalid mask", function () {
      expect(() =>
        networkMaskContains("192.168.0.1/24", "-255.0.0.0", "192.168.0.16")
      ).to.throw();
    });
    it("should error - invalid ip", function () {
      expect(() =>
        networkMaskContains("192.168.0.1/24", "255.0.0.0", "192.168.0")
      ).to.throw();
    });
  });
});
