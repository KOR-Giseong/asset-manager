import { prisma } from "@/lib/prisma";

interface CreateUserInput {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(input: CreateUserInput) {
  return prisma.user.create({ data: input });
}
