"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { exhaustProduct, toggleProductSize, type StockState } from "@/lib/stock";
import { readStockState, updateStockState } from "@/lib/stock-blob";
import { readCatalogState } from "@/lib/catalog-blob";

export type StockActionResult =
  | { status: "success"; message: string; state: StockState }
  | { status: "error"; message: string };

async function persist(
  expectedVersion: number,
  productId: string,
  update: (state: StockState, product: Awaited<ReturnType<typeof readCatalogState>>["teams"][number]["products"][number]) => StockState,
): Promise<StockActionResult> {
  await requireAdmin();

  try {
    const catalog = await readCatalogState();
    const product = catalog.teams.flatMap((team) => team.products).find((item) => item.id === productId);
    if (!product) throw new Error("El producto no existe en el catálogo público.");
    const state = await updateStockState(expectedVersion, (stock) => update(stock, product));
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath("/panel-privado-camisetas");
    return { status: "success", message: "Guardado", state };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar el stock.",
    };
  }
}

export async function toggleStockSize(
  productId: string,
  size: string,
  expectedVersion: number,
): Promise<StockActionResult> {
  return persist(expectedVersion, productId, (state, product) => toggleProductSize(state, product, size));
}

export async function exhaustStockProduct(
  productId: string,
  expectedVersion: number,
): Promise<StockActionResult> {
  return persist(expectedVersion, productId, (state, product) => exhaustProduct(state, product));
}

export async function getPanelStockState() {
  await requireAdmin();
  return readStockState();
}
