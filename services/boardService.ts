import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { NoticeType } from "@/types/board";
import {
  getPostDetail,
  createComment,
  createReport,
  deleteComment,
  getMyComments,
} from "@/repositories/board-repository";

export async function createPost(data: {
  title: string;
  content: string;
  authorId: string;
  isAnonymous?: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma.post.create as any)({ data });
}

export async function updatePost(
  id: string,
  data: { title: string; content: string },
  user: User
) {
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

export async function createNotice(data: {
  title: string;
  content: string;
  type: NoticeType;
  authorId: string;
}) {
  return prisma.notice.create({ data });
}

export async function updateNotice(
  id: string,
  data: { title: string; content: string; type: NoticeType },
  user: User
) {
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

export async function getBoardDetailServer(postId: string) {
  return getPostDetail(postId);
}

export async function getMyCommentsService(userId: string) {
  return getMyComments(userId);
}

export async function createCommentService({
  postId,
  authorId,
  content,
  parentId,
  isAnonymous,
}: {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  isAnonymous?: boolean;
}) {
  return createComment({ postId, authorId, content, parentId, isAnonymous });
}

export async function deleteCommentService(commentId: string, user: User) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("댓글 없음");
  if (comment.authorId !== user.id && user.role !== "ADMIN") throw new Error("권한 없음");
  return deleteComment(commentId);
}

export async function reportPostService({
  reporterId,
  postId,
  reason,
}: {
  reporterId: string;
  postId: string;
  reason: string;
}) {
  // 중복 신고 방지
  const existing = await prisma.report.findFirst({
    where: { reporterId, postId },
  });
  if (existing) throw new Error("이미 신고한 게시글입니다.");
  return createReport({ reporterId, postId, reason });
}

export async function reportCommentService({
  reporterId,
  commentId,
  reason,
}: {
  reporterId: string;
  commentId: string;
  reason: string;
}) {
  const existing = await prisma.report.findFirst({
    where: { reporterId, commentId },
  });
  if (existing) throw new Error("이미 신고한 댓글입니다.");
  return createReport({ reporterId, commentId, reason });
}
