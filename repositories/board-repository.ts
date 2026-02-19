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
      author: { select: { id: true, nickname: true, role: true } },
      comments: {
        include: {
          author: { select: { id: true, nickname: true, role: true } },
          reports: true,
          children: {
            include: {
              author: { select: { id: true, nickname: true, role: true } },
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
  screenshotUrl,
}: {
  reporterId: string;
  reason: string;
  postId?: string;
  commentId?: string;
  screenshotUrl?: string;
}) {
  return prisma.report.create({
    data: {
      reporterId,
      reason,
      postId: postId || undefined,
      commentId: commentId || undefined,
      screenshotUrl: screenshotUrl || undefined,
    },
  });
}

export async function updateNoticePinned(id: string, isPinned: boolean) {
  return prisma.notice.update({ where: { id }, data: { isPinned } });
}

export async function addLike(userId: string, postId: string) {
  return prisma.like.create({ data: { userId, postId } });
}

export async function removeLike(userId: string, postId: string) {
  return prisma.like.delete({ where: { userId_postId: { userId, postId } } });
}

export async function getUserLikedPostIds(userId: string) {
  const likes = await prisma.like.findMany({
    where: { userId },
    select: { postId: true },
  });
  return likes.map((l) => l.postId);
}

export async function getHotPostsRepo() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentLikes = await prisma.like.groupBy({
    by: ["postId"],
    where: { createdAt: { gte: since } },
    _count: { postId: true },
    orderBy: { _count: { postId: "desc" } },
    take: 3,
  });

  if (recentLikes.length === 0) return [];

  const postIds = recentLikes.map((l) => l.postId);
  const likeCountMap = Object.fromEntries(
    recentLikes.map((l) => [l.postId, l._count.postId])
  );

  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    include: { author: { select: { id: true, nickname: true } } },
  });

  return posts
    .sort((a, b) => (likeCountMap[b.id] ?? 0) - (likeCountMap[a.id] ?? 0))
    .map((p) => ({ ...p, recentLikeCount: likeCountMap[p.id] ?? 0 }));
}
