"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";
import {
  addCatalogProduct,
  addCatalogTeam,
  deleteCatalogProduct as removeCatalogProduct,
  updateCatalogProduct,
  type CatalogState,
} from "@/lib/catalog";
import { readCatalogState, updateCatalogState } from "@/lib/catalog-blob";

export type CatalogActionResult =
  | { status: "success"; message: string; state: CatalogState }
  | { status: "error"; message: string };

function text(value: FormDataEntryValue | null, label: string) {
  const result = typeof value === "string" ? value.trim() : "";
  if (!result) throw new Error(`${label} es obligatorio.`);
  return result;
}

function optionalText(value: FormDataEntryValue | null) {
  const result = typeof value === "string" ? value.trim() : "";
  return result || undefined;
}

function positivePrice(value: FormDataEntryValue | null) {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) throw new Error("El precio debe ser un número válido.");
  return price;
}

function sizes(value: FormDataEntryValue | null) {
  const result = text(value, "Los talles").split(",").map((size) => size.trim()).filter(Boolean);
  if (result.length === 0) throw new Error("Agregá al menos un talle.");
  return [...new Set(result)];
}

function safeSlug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fileIsImage(file: FormDataEntryValue | null): file is File {
  return file instanceof File && file.size > 0 && file.type.startsWith("image/");
}

async function uploadImage(file: File) {
  const filename = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  return (await put(`camisetas/products/${crypto.randomUUID()}-${filename}`, file, { access: "public" })).url;
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/panel-privado-camisetas");
}

export async function getPanelCatalog() {
  await requireAdmin();
  return readCatalogState();
}

export async function saveCatalogProduct(productId: string, formData: FormData, expectedVersion: number): Promise<CatalogActionResult> {
  await requireAdmin();
  try {
    const image = formData.get("image");
    const imageUrl = fileIsImage(image) ? await uploadImage(image) : undefined;
    const productUpdate = {
      name: text(formData.get("name"), "El nombre"),
      year: optionalText(formData.get("year")),
      price: positivePrice(formData.get("price")),
      teamId: text(formData.get("teamId"), "El equipo"),
      category: text(formData.get("category"), "La categoría"),
      sizes: sizes(formData.get("sizes")),
      ...(imageUrl ? { image: imageUrl } : {}),
    };
    const state = await updateCatalogState(expectedVersion, (current) => updateCatalogProduct(current, productId, {
      ...productUpdate,
    }));
    revalidateCatalog();
    return { status: "success", message: "Producto guardado.", state };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo guardar el producto." };
  }
}

export async function deleteCatalogProduct(productId: string, expectedVersion: number): Promise<CatalogActionResult> {
  await requireAdmin();
  try {
    const state = await updateCatalogState(expectedVersion, (current) => removeCatalogProduct(current, productId));
    revalidateCatalog();
    return { status: "success", message: "Producto eliminado.", state };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo eliminar el producto." };
  }
}

export async function createCatalogTeam(formData: FormData, expectedVersion: number): Promise<CatalogActionResult> {
  await requireAdmin();
  try {
    const name = text(formData.get("name"), "El nombre");
    const slug = safeSlug(text(formData.get("slug"), "El slug"));
    if (!slug) throw new Error("El slug no es válido.");
    const state = await updateCatalogState(expectedVersion, (current) => addCatalogTeam(current, {
      id: slug,
      name,
      slug,
      bannerDesktop: "/camisetas/Boca/banner2.jpg",
      bannerMobile: "/camisetas/Boca/banner2.jpg",
      products: [],
    }));
    revalidateCatalog();
    return { status: "success", message: "Equipo agregado.", state };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo guardar el equipo." };
  }
}

export async function createCatalogProduct(formData: FormData, expectedVersion: number): Promise<CatalogActionResult> {
  await requireAdmin();
  try {
    const image = formData.get("image");
    if (!fileIsImage(image)) throw new Error("La imagen principal es obligatoria y debe ser válida.");
    const product = {
      id: text(formData.get("id"), "El ID"),
      name: text(formData.get("name"), "El nombre"),
      year: optionalText(formData.get("year")),
      price: positivePrice(formData.get("price")),
      image: await uploadImage(image),
      sizes: sizes(formData.get("sizes")),
      category: text(formData.get("category"), "La categoría"),
      inStock: true,
    };
    const state = await updateCatalogState(expectedVersion, (current) => addCatalogProduct(current, text(formData.get("teamId"), "El equipo"), product));
    revalidateCatalog();
    return { status: "success", message: "Producto agregado.", state };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo guardar el producto." };
  }
}
