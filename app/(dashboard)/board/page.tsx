import { getCurrentUser } from "@/lib/auth";
import { getBoardData } from "@/repositories/board-repository";
import { BoardClient } from "./components/BoardClient";
import type { Notice, Post } from "@/types/board";

export default async function BoardPage() {
  const user = await getCurrentUser();
  const { notices, posts } = await getBoardData();

  // Date → string 직렬화 (Server → Client 전달용)
  const serializedNotices = notices.map((n: Notice) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  const serializedPosts = posts.map((p: Post) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    isMine: p.authorId === user.id,
  }));

  return (
    <BoardClient
      notices={serializedNotices}
      posts={serializedPosts}
      isAdmin={user.role === "ADMIN"}
      userId={user.id}
    />
  );
}
