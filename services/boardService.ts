import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { Post, Notice, NoticeType } from "@/types/board";

export async function createPost(data: { title: string; content: string; authorId: string }) {
  return prisma.post.create({ data });
}

export async function updatePost(id: string, data: { title: string; content: string }, user: User) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("게시글 없음");
  if (post.authorId !== user.id && user.role !== "ADMIN") throw new Error("권한 없음");
  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: string, user: User) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("게시글 없음");
  if (post.authorId !== user.id && user.role !== "ADMIN") throw new Error("권한 없음");
  return prisma.post.delete({ where: { id } });
}

export async function createNotice(data: { title: string; content: string; type: NoticeType; authorId: string }) {
  return prisma.notice.create({ data });
}

export async function updateNotice(id: string, data: { title: string; content: string; type: NoticeType }, user: User) {
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) throw new Error("공지 없음");
  if (notice.authorId !== user.id && user.role !== "ADMIN") throw new Error("권한 없음");
  return prisma.notice.update({ where: { id }, data });
}

export async function deleteNotice(id: string, user: User) {
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) throw new Error("공지 없음");
  if (notice.authorId !== user.id && user.role !== "ADMIN") throw new Error("권한 없음");
  return prisma.notice.delete({ where: { id } });
}
