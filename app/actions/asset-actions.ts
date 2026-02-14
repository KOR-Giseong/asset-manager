"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function getCurrentUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  return session.user.id;
}

export type Asset = {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentPrice: number;
  userId: string;
};

export async function getAssets(): Promise<Asset[]> {
  const userId = await getCurrentUserId();

  const assets = await prisma.asset.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });

  return assets;
}

export async function addAsset(formData: FormData) {
  const userId = await getCurrentUserId();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currentPrice = parseFloat(formData.get("currentPrice") as string);

  if (!name || !type || isNaN(amount) || isNaN(currentPrice)) {
    throw new Error("잘못된 입력입니다.");
  }

  await prisma.asset.create({
    data: {
      name,
      type,
      amount,
      currentPrice,
      userId,
    },
  });

  revalidatePath("/");
}

export async function deleteAsset(id: string) {
  const userId = await getCurrentUserId();

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset || asset.userId !== userId) {
    throw new Error("권한이 없습니다.");
  }

  await prisma.transaction.deleteMany({
    where: { assetId: id },
  });

  await prisma.asset.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function updateAsset(formData: FormData) {
  const userId = await getCurrentUserId();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currentPrice = parseFloat(formData.get("currentPrice") as string);

  if (!id || !name || !type || isNaN(amount) || isNaN(currentPrice)) {
    throw new Error("잘못된 입력입니다.");
  }

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset || asset.userId !== userId) {
    throw new Error("권한이 없습니다.");
  }

  await prisma.asset.update({
    where: { id },
    data: {
      name,
      type,
      amount,
      currentPrice,
    },
  });

  revalidatePath("/");
}
