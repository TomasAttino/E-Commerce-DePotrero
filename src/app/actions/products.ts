"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

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
    const blob = await put(bannerFile.name, bannerFile, {
      access: 'public',
    });
    bannerUrl = blob.url;
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

  const updateData: any = {
    name,
    slug,
  };

  if (bannerFile && bannerFile.size > 0) {
    const blob = await put(bannerFile.name, bannerFile, {
      access: 'public',
    });
    updateData.banner = blob.url;
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
    const blob = await put(imageFile.name, imageFile, {
      access: 'public',
    });
    imageUrl = blob.url;
  }

  if (hoverImageFile && hoverImageFile.size > 0) {
    const blob = await put(hoverImageFile.name, hoverImageFile, {
      access: 'public',
    });
    hoverImageUrl = blob.url;
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

  const updateData: any = {
    name,
    price,
    category,
    sizes,
    colors,
    inStock,
  };

  if (imageFile && imageFile.size > 0) {
    const blob = await put(imageFile.name, imageFile, {
      access: 'public',
    });
    updateData.image = blob.url;
  }

  if (hoverImageFile && hoverImageFile.size > 0) {
    const blob = await put(hoverImageFile.name, hoverImageFile, {
      access: 'public',
    });
    updateData.hoverImage = blob.url;
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
