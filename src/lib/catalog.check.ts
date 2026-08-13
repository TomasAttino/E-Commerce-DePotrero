import assert from "node:assert/strict";
import { teamsMock } from "../../public/camisetas/mock.ts";
import {
  addCatalogProduct,
  addCatalogTeam,
  createCatalogState,
  deleteCatalogProduct,
  filterCatalogProducts,
  getProductGallery,
  paginate,
  selectNewCatalogProducts,
  updateCatalogProduct,
  selectUploadedGallery,
  validateProductGallery,
  MAX_PRODUCT_IMAGES,
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
  isNew: true,
};
assert.deepEqual(getProductGallery(newProduct), [newProduct.image]);
assert.deepEqual(getProductGallery({ ...newProduct, hoverImage: "hover.png" }), [newProduct.image, "hover.png"]);
assert.deepEqual(getProductGallery({ ...newProduct, images: ["one.png", "two.png"], hoverImage: "legacy.png" }), ["one.png", "two.png"]);
assert.deepEqual(selectUploadedGallery(["new-1.png", "new-2.png"], newProduct), { image: "new-1.png", images: ["new-1.png", "new-2.png"] });
assert.deepEqual(selectUploadedGallery([], { image: "old.png", images: ["old.png", "old-2.png"] }), { image: "old.png", images: ["old.png", "old-2.png"] });
assert.equal(MAX_PRODUCT_IMAGES, 4);
const selectedFiles = ["one.jpg", "two.jpg", "three.jpg", "four.jpg"];
assert.equal(selectedFiles.length, MAX_PRODUCT_IMAGES);
assert.deepEqual(validateProductGallery([" third.png ", "first.png", "second.png"]), ["third.png", "first.png", "second.png"]);
assert.throws(() => validateProductGallery([]), /al menos una imagen/);
assert.throws(() => validateProductGallery(["1", "2", "3", "4", "5"]), /4 imágenes/);
const withProduct = addCatalogProduct(withTeam, "nuevo-equipo", newProduct);
assert.equal(withProduct.teams.find((team) => team.id === "nuevo-equipo")?.products[0].isNew, true);
const edited = updateCatalogProduct(withProduct, newProduct.id, { name: "Buzo Editado", year: "2026", price: 35000, isNew: false, teamId: "boca" });
assert.equal(edited.teams.find((team) => team.id === "boca")?.products.some((product) => product.id === newProduct.id), true);
assert.equal(filterCatalogProducts(edited, "editado", "boca").length, 1);
assert.equal(paginate(Array.from({ length: 25 }, (_, index) => index), 2).items.length, 1);

const product = edited.teams.find((team) => team.id === "boca")!.products.find((item) => item.id === newProduct.id)!;
assert.equal(product.year, "2026");
assert.equal(product.isNew, false);
assert.deepEqual(selectNewCatalogProducts([newProduct, product]).map((item) => item.id), [newProduct.id]);
const deleted = deleteCatalogProduct(edited, newProduct.id);
assert.equal(deleted.teams.find((team) => team.id === "boca")?.products.some((item) => item.id === newProduct.id), false);
assert.equal(deleted.teams.length, edited.teams.length);
assert.throws(() => deleteCatalogProduct(edited, "missing-product"), /no existe/);
const stock = toggleProductSize(emptyStockState(), product, "M");
assert.deepEqual(resolveProductStock(product, stock).availableSizes, ["L"]);

console.log("catalog check passed: fallback, team/product mutations, editing, filtering, pagination and new-product stock");
