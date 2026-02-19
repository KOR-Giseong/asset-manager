import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBoardDetailServer, getUserLikedPostIdsService } from "@/services/boardService";
import { PostDetailClient } from "./PostDetailClient";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const [post, likedPostIds] = await Promise.all([
    getBoardDetailServer(params.id),
    getUserLikedPostIdsService(user.id),
  ]);

  if (!post) notFound();

  const isLiked = likedPostIds.includes(params.id);

  // Date → string 직렬화 (Server → Client 전달용)
  const serializedPost = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    comments: post.comments
      .filter((c) => !c.parentId) // 최상위 댓글만
      .map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        children: c.children.map((ch) => ({
          ...ch,
          createdAt: ch.createdAt.toISOString(),
          updatedAt: ch.updatedAt.toISOString(),
        })),
      })),
  };

  return (
    <PostDetailClient
      post={serializedPost}
      currentUserId={user.id}
      isAdmin={user.role === "ADMIN"}
      isLiked={isLiked}
      likeCount={post.likeCount}
    />
  );
}
