import assert from "node:assert/strict";
import { teamsMock } from "../../public/camisetas/mock.ts";
import {
  addCatalogProduct,
  addCatalogTeam,
  createCatalogState,
  deleteCatalogProduct,
  filterCatalogProducts,
  paginate,
  updateCatalogProduct,
} from "./catalog.ts";
import { emptyStockState, resolveProductStock, toggleProductSize } from "./stock.ts";
import { isStateVersionBehind } from "./blob-version.ts";

const initial = createCatalogState(teamsMock);
assert.equal(initial.teams.length, teamsMock.length);
assert.equal(isStateVersionBehind(3, 4), true);
assert.equal(isStateVersionBehind(4, 4), false);
assert.equal(isStateVersionBehind(5, 4), false);

const withTeam = addCatalogTeam(initial, {
  id: "nuevo-equipo",
  name: "Nuevo Equipo",
  slug: "nuevo-equipo",
  bannerDesktop: "/camisetas/Boca/banner2.jpg",
  bannerMobile: "/camisetas/Boca/banner2.jpg",
  products: [],
});
const newProduct = {
  id: "nuevo-equipo-1",
  name: "Buzo Inicial",
  year: "2025/26",
  price: 30000,
  image: "https://example.com/buzo.png",
  sizes: ["M", "L"],
  category: "Buzos",
  inStock: true,
};
const withProduct = addCatalogProduct(withTeam, "nuevo-equipo", newProduct);
const edited = updateCatalogProduct(withProduct, newProduct.id, { name: "Buzo Editado", year: "2026", price: 35000, teamId: "boca" });
assert.equal(edited.teams.find((team) => team.id === "boca")?.products.some((product) => product.id === newProduct.id), true);
assert.equal(filterCatalogProducts(edited, "editado", "boca").length, 1);
assert.equal(paginate(Array.from({ length: 25 }, (_, index) => index), 2).items.length, 1);

const product = edited.teams.find((team) => team.id === "boca")!.products.find((item) => item.id === newProduct.id)!;
assert.equal(product.year, "2026");
const deleted = deleteCatalogProduct(edited, newProduct.id);
assert.equal(deleted.teams.find((team) => team.id === "boca")?.products.some((item) => item.id === newProduct.id), false);
assert.equal(deleted.teams.length, edited.teams.length);
assert.throws(() => deleteCatalogProduct(edited, "missing-product"), /no existe/);
const stock = toggleProductSize(emptyStockState(), product, "M");
assert.deepEqual(resolveProductStock(product, stock).availableSizes, ["L"]);

console.log("catalog check passed: fallback, team/product mutations, editing, filtering, pagination and new-product stock");
