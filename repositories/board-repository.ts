import { prisma } from "@/lib/prisma";

export async function getBoardData() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "desc" }],
  });
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { notices, posts };
}
