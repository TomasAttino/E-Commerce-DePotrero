"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";


export async function getTeams() {
  return await prisma.team.findMany({
    include: {
      products: true,
    },
    orderBy: {
      name: 'asc'
    }
  });
}

export async function createTeam(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const bannerFile = formData.get("banner") as File;

  let bannerUrl = "";

  if (bannerFile && bannerFile.size > 0) {
    const buffer = Buffer.from(await bannerFile.arrayBuffer());
    const fileName = `${Date.now()}-${bannerFile.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.writeFile(filePath, buffer);
    bannerUrl = `/uploads/${fileName}`;
  }

  const team = await prisma.team.create({
    data: {
      name,
      slug,
      banner: bannerUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/panel-privado-camisetas");
  return team;
}

export async function updateTeam(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const bannerFile = formData.get("banner") as File;

  const updateData: {
    name: string;
    slug: string;
    banner?: string;
  } = {
    name,
    slug,
  };

  if (bannerFile && bannerFile.size > 0) {
    const buffer = Buffer.from(await bannerFile.arrayBuffer());
    const fileName = `${Date.now()}-${bannerFile.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.writeFile(filePath, buffer);
    updateData.banner = `/uploads/${fileName}`;
  }

  const team = await prisma.team.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/panel-privado-camisetas");
  return team;
}

export async function deleteTeam(id: string) {
  // Primero borrar productos del equipo para evitar errores de FK si no está en cascade
  await prisma.product.deleteMany({
    where: { teamId: id }
  });
  
  await prisma.team.delete({
    where: { id },
  });
  
  revalidatePath("/");
  revalidatePath("/panel-privado-camisetas");
}

export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
  });
}

export async function getTeamById(id: string) {
  return await prisma.team.findUnique({
    where: { id },
  });
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const teamId = formData.get("teamId") as string;
  const sizes = formData.get("sizes") as string;
  const colors = formData.get("colors") as string;
  const inStock = formData.get("inStock") === "on";
  const imageFile = formData.get("image") as File;
  const hoverImageFile = formData.get("hoverImage") as File;

  let imageUrl = "";
  let hoverImageUrl = "";

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = `${Date.now()}-primary-${imageFile.name}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  if (hoverImageFile && hoverImageFile.size > 0) {
    const buffer = Buffer.from(await hoverImageFile.arrayBuffer());
    const fileName = `${Date.now()}-hover-${hoverImageFile.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.writeFile(filePath, buffer);
    hoverImageUrl = `/uploads/${fileName}`;
  }

  const product = await prisma.product.create({
    data: {
      name,
      price,
      category,
      teamId,
      sizes,
      colors,
      inStock,
      image: imageUrl,
      hoverImage: hoverImageUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/panel-privado-camisetas");
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const sizes = formData.get("sizes") as string;
  const colors = formData.get("colors") as string;
  const inStock = formData.get("inStock") === "on";
  const imageFile = formData.get("image") as File;
  const hoverImageFile = formData.get("hoverImage") as File;

  const updateData: {
    name: string;
    price: number;
    category: string;
    sizes: string;
    colors: string;
    inStock: boolean;
    image?: string;
    hoverImage?: string | null;
  } = {
    name,
    price,
    category,
    sizes,
    colors,
    inStock,
  };

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = `${Date.now()}-primary-${imageFile.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.writeFile(filePath, buffer);
    updateData.image = `/uploads/${fileName}`;
  }

  if (hoverImageFile && hoverImageFile.size > 0) {
    const buffer = Buffer.from(await hoverImageFile.arrayBuffer());
    const fileName = `${Date.now()}-hover-${hoverImageFile.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.writeFile(filePath, buffer);
    updateData.hoverImage = `/uploads/${fileName}`;
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/panel-privado-camisetas");
  return product;
}



export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath("/");
  revalidatePath("/panel-privado-camisetas");
}
