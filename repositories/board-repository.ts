import { prisma } from "@/lib/prisma";
import { PostTag } from "@/types/board";

export async function getBoardData() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "desc" }],
    include: {
      author: { select: { id: true, nickname: true } },
    },
  });
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, nickname: true } },
      _count: { select: { comments: true } },
    },
  });
  return { notices, posts };
}

export async function getMyComments(userId: string) {
  return prisma.comment.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { id: true, title: true } },
    },
  });
}

export async function getPostDetail(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, nickname: true } },
      comments: {
        include: {
          author: { select: { id: true, nickname: true } },
          reports: true,
          children: {
            include: {
              author: { select: { id: true, nickname: true } },
              reports: true,
            },
          },
        },
      },
      reports: true,
    },
  });
}

export async function createPostRepo(data: {
  title: string;
  content: string;
  authorId: string;
  tag?: PostTag;
  isAnonymous?: boolean;
}) {
  return prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      tag: data.tag ?? "FREE",
      isAnonymous: data.isAnonymous ?? false,
    },
  });
}

export async function createComment({
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
  return prisma.comment.create({
    data: {
      postId,
      authorId,
      content,
      parentId: parentId || undefined,
      isAnonymous: isAnonymous ?? false,
    },
  });
}

export async function deleteComment(commentId: string) {
  return prisma.comment.delete({ where: { id: commentId } });
}

export async function createReport({
  reporterId,
  reason,
  postId,
  commentId,
}: {
  reporterId: string;
  reason: string;
  postId?: string;
  commentId?: string;
}) {
  return prisma.report.create({
    data: {
      reporterId,
      reason,
      postId: postId || undefined,
      commentId: commentId || undefined,
    },
  });
}

export async function updateNoticePinned(id: string, isPinned: boolean) {
  return prisma.notice.update({ where: { id }, data: { isPinned } });
}
