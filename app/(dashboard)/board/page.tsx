import { getCurrentUser } from "@/lib/auth";
import { getBoardData } from "@/repositories/board-repository";
import {
  getMyCommentsService,
  getUserLikedPostIdsService,
  getHotPostsService,
} from "@/services/boardService";
import { BoardClient } from "./components/BoardClient";

export default async function BoardPage() {
  const user = await getCurrentUser();
  const [{ notices, posts }, myComments, likedPostIds, hotPosts] = await Promise.all([
    getBoardData(),
    getMyCommentsService(user.id),
    getUserLikedPostIdsService(user.id),
    getHotPostsService(),
  ]);

  const serializedNotices = notices.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    type: n.type,
    isPinned: n.isPinned,
    createdAt: n.createdAt.toISOString(),
    authorId: n.authorId,
    authorNickname: n.author.nickname,
  }));

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    tag: p.tag,
    createdAt: p.createdAt.toISOString(),
    authorId: p.authorId,
    authorNickname: p.author.nickname,
    isMine: p.authorId === user.id,
    isAnonymous: p.isAnonymous,
    commentCount: p._count.comments,
    likeCount: p.likeCount,
    isLikedByMe: likedPostIds.includes(p.id),
  }));

  const serializedMyComments = myComments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    postId: c.post.id,
    postTitle: c.post.title,
    isAnonymous: c.isAnonymous,
  }));

  const serializedHotPosts = hotPosts.map((p) => ({
    id: p.id,
    title: p.title,
    isAnonymous: p.isAnonymous,
    recentLikeCount: p.recentLikeCount,
  }));

  return (
    <BoardClient
      notices={serializedNotices}
      posts={serializedPosts}
      myComments={serializedMyComments}
      hotPosts={serializedHotPosts}
      isAdmin={user.role === "ADMIN"}
      userId={user.id}
    />
  );
}
