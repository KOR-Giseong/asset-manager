import { prisma } from "@/lib/prisma";
import type { Asset, CreateAssetInput, UpdateAssetInput } from "@/types/asset";

export async function findAssetsByUserId(userId: string): Promise<Asset[]> {
  return prisma.asset.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  }) as Promise<Asset[]>;
}

export async function findAssetById(id: string): Promise<Asset | null> {
  return prisma.asset.findUnique({ where: { id } }) as Promise<Asset | null>;
}

export async function findAssetsWithSymbol(userId: string): Promise<Asset[]> {
  return prisma.asset.findMany({
    where: {
      userId,
      symbol: { not: null },
    },
  }) as Promise<Asset[]>;
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  return prisma.asset.create({ data: input }) as Promise<Asset>;
}

export async function updateAsset(id: string, input: UpdateAssetInput): Promise<Asset> {
  return prisma.asset.update({
    where: { id },
    data: input,
  }) as Promise<Asset>;
}

export async function updateAssetPrice(id: string, currentPrice: number): Promise<Asset> {
  return prisma.asset.update({
    where: { id },
    data: { currentPrice },
  }) as Promise<Asset>;
}

export async function deleteAssetWithTransactions(id: string): Promise<void> {
  await prisma.transaction.deleteMany({ where: { assetId: id } });
  await prisma.asset.delete({ where: { id } });
}
