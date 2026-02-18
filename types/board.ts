export type NoticeType = "NOTICE" | "PATCH";
export type PostTag = "FREE" | "INFO" | "QUESTION";

export const POST_TAG_LABELS: Record<PostTag, string> = {
  FREE: "자유글",
  INFO: "정보공유",
  QUESTION: "질문",
};

export interface Post {
  id: string;
  title: string;
  content: string;
  tag: PostTag;
  createdAt: Date;
  authorId: string;
  isMine?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: NoticeType;
  isPinned: boolean;
  createdAt: Date;
  authorId: string;
}
