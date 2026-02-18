"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { PostTag } from "@/types/board";
import {
  createPost,
  updatePost,
  deletePost,
  createNotice,
  updateNotice,
  deleteNotice,
  createCommentService,
  deleteCommentService,
  reportPostService,
  reportCommentService,
  pinNoticeService,
} from "@/services/boardService";

export async function writePost(data: {
  title: string;
  content: string;
  tag?: PostTag;
  isAnonymous?: boolean;
}) {
  const user = await getCurrentUser();
  await createPost({ ...data, authorId: user.id });
  revalidatePath("/board");
}

export async function editPost(
  id: string,
  data: { title: string; content: string; tag?: PostTag }
) {
  const user = await getCurrentUser();
  await updatePost(id, data, user);
  revalidatePath("/board");
}

export async function removePost(id: string) {
  const user = await getCurrentUser();
  await deletePost(id, user);
  revalidatePath("/board");
}

export async function writeNotice(data: {
  title: string;
  content: string;
  type: "NOTICE" | "PATCH";
  isPinned?: boolean;
}) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") throw new Error("권한 없음");
  await createNotice({ ...data, authorId: user.id });
  revalidatePath("/board");
}

export async function editNotice(
  id: string,
  data: { title: string; content: string; type: "NOTICE" | "PATCH"; isPinned?: boolean }
) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") throw new Error("권한 없음");
  await updateNotice(id, data, user);
  revalidatePath("/board");
}

export async function removeNotice(id: string) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") throw new Error("권한 없음");
  await deleteNotice(id, user);
  revalidatePath("/board");
}

export async function togglePinNotice(id: string, isPinned: boolean) {
  const user = await getCurrentUser();
  await pinNoticeService(id, isPinned, user);
  revalidatePath("/board");
}

export async function addComment(
  postId: string,
  content: string,
  parentId?: string,
  isAnonymous?: boolean
) {
  const user = await getCurrentUser();
  await createCommentService({ postId, authorId: user.id, content, parentId, isAnonymous });
  revalidatePath(`/board/${postId}`);
}

export async function removeComment(commentId: string, postId: string) {
  const user = await getCurrentUser();
  await deleteCommentService(commentId, user);
  revalidatePath(`/board/${postId}`);
}

export async function reportPost(postId: string, reason: string) {
  const user = await getCurrentUser();
  await reportPostService({ reporterId: user.id, postId, reason });
}

export async function reportComment(commentId: string, reason: string) {
  const user = await getCurrentUser();
  await reportCommentService({ reporterId: user.id, commentId, reason });
}
