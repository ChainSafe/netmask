import { expect } from "chai";
import { cidrContains } from "../src/index.js";

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
});
