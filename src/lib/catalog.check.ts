import assert from "node:assert/strict";
import { teamsMock } from "../../public/camisetas/mock.ts";
import {
  addCatalogProduct,
  addCatalogTeam,
  createCatalogState,
  filterCatalogProducts,
  paginate,
  updateCatalogProduct,
} from "./catalog.ts";
import { emptyStockState, resolveProductStock, toggleProductSize } from "./stock.ts";

const initial = createCatalogState(teamsMock);
assert.equal(initial.teams.length, teamsMock.length);

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
  price: 30000,
  image: "https://example.com/buzo.png",
  sizes: ["M", "L"],
  category: "Buzos",
  inStock: true,
};
const withProduct = addCatalogProduct(withTeam, "nuevo-equipo", newProduct);
const edited = updateCatalogProduct(withProduct, newProduct.id, { name: "Buzo Editado", price: 35000, teamId: "boca" });
assert.equal(edited.teams.find((team) => team.id === "boca")?.products.some((product) => product.id === newProduct.id), true);
assert.equal(filterCatalogProducts(edited, "editado", "boca").length, 1);
assert.equal(paginate(Array.from({ length: 25 }, (_, index) => index), 2).items.length, 1);

const product = edited.teams.find((team) => team.id === "boca")!.products.find((item) => item.id === newProduct.id)!;
const stock = toggleProductSize(emptyStockState(), product, "M");
assert.deepEqual(resolveProductStock(product, stock).availableSizes, ["L"]);

console.log("catalog check passed: fallback, team/product mutations, editing, filtering, pagination and new-product stock");
