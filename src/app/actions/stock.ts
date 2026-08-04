"use server";

import { revalidatePath } from "next/cache";
import { teamsMock } from "../../../public/camisetas/mock";
import { requireAdmin } from "@/lib/admin-auth";
import { exhaustProduct, toggleProductSize, type StockState } from "@/lib/stock";
import { readStockState, updateStockState } from "@/lib/stock-blob";

export type StockActionResult =
  | { status: "success"; message: string; state: StockState }
  | { status: "error"; message: string };

function findProduct(productId: string) {
  for (const team of teamsMock) {
    const product = team.products.find((item) => item.id === productId);
    if (product) return product;
  }
  throw new Error("El producto no existe en el catálogo público.");
}

async function persist(
  expectedVersion: number,
  update: (state: StockState) => StockState,
): Promise<StockActionResult> {
  await requireAdmin();

  try {
    const state = await updateStockState(expectedVersion, update);
    revalidatePath("/");
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
  const product = findProduct(productId);
  return persist(expectedVersion, (state) => toggleProductSize(state, product, size));
}

export async function exhaustStockProduct(
  productId: string,
  expectedVersion: number,
): Promise<StockActionResult> {
  const product = findProduct(productId);
  return persist(expectedVersion, (state) => exhaustProduct(state, product));
}

export async function getPanelStockState() {
  await requireAdmin();
  return readStockState();
}
