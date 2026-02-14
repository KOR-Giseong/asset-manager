import { prisma } from "@/lib/prisma";
import type { Property, CreatePropertyInput } from "@/types/property";

export async function findPropertiesByUserId(userId: string): Promise<Property[]> {
  return prisma.property.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  }) as Promise<Property[]>;
}

export async function findPropertyByIdAndUserId(
  id: string,
  userId: string
): Promise<Property | null> {
  return prisma.property.findFirst({
    where: { id, userId },
  }) as Promise<Property | null>;
}

export async function createProperty(
  input: CreatePropertyInput,
  userId: string
): Promise<Property> {
  return prisma.property.create({
    data: { ...input, userId },
  }) as Promise<Property>;
}

export async function updatePropertyById(
  id: string,
  data: Partial<CreatePropertyInput>
): Promise<Property> {
  return prisma.property.update({
    where: { id },
    data,
  }) as Promise<Property>;
}

export async function deletePropertyById(id: string): Promise<void> {
  await prisma.property.delete({ where: { id } });
}

export async function findExpiringProperties(
  userId: string,
  daysThreshold: number
): Promise<Property[]> {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + daysThreshold);

  return prisma.property.findMany({
    where: {
      userId,
      contractEndDate: {
        gte: now,
        lte: threshold,
      },
    },
    orderBy: { contractEndDate: "asc" },
  }) as Promise<Property[]>;
}
