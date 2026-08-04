import assert from "node:assert/strict";
import { teamsMock } from "../../public/camisetas/mock.ts";
import { resolveTeamsStock, resolveUnavailableTeamsStock, emptyStockState } from "./stock.ts";

const verified = resolveTeamsStock(teamsMock, {
  ...emptyStockState(),
  products: {
    [teamsMock[0].products[0].id]: { exhausted: false, unavailableSizes: ["S"] },
  },
});
const verifiedProduct = verified[0].products[0];
assert.equal(verifiedProduct.availableSizes.includes("S"), false);
assert.equal(verifiedProduct.availableSizes.includes("M"), true);
assert.equal(verifiedProduct.availableSizes.length, verifiedProduct.sizes.length - 1);

const unavailable = resolveUnavailableTeamsStock(teamsMock);
for (const team of unavailable) {
  for (const product of team.products) {
    assert.equal(product.inStock, false);
    assert.deepEqual(product.availableSizes, []);
    assert.deepEqual(product.unavailableSizes, product.sizes);
  }
}

console.log("stock check passed: verified state enables normal availability; unavailable state enables zero purchasable sizes");
