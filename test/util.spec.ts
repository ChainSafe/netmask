import { parseIP, parseIPv4 } from "@chainsafe/is-ip/parse";
import { expect } from "@esm-bundle/chai";
import { cidrMask } from "../src/cidr.js";
import { simpleMaskLength } from "../src/util.js";

describe("utils", function () {
  describe("simpleMaskLength", function () {
    const cases: [Uint8Array, number][] = [
      [cidrMask(26, 32), 26],
      [parseIPv4("255.0.255.0")!, -1],
      [parseIPv4("255.255.255.0")!, 24],
      [cidrMask(55, 128), 55],
      [parseIP("8000:f123:0:cafe::")!, -1],
    ];

    cases.forEach(([mask, length]) => {
      it(`mask=${String(mask)} result=${length}`, function () {
        expect(simpleMaskLength(mask)).to.be.equal(length);
      });
    });
  });
});
