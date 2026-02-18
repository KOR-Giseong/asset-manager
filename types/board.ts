export type NoticeType = "NOTICE" | "PATCH";

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorId: string;
  isMine?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: NoticeType;
  createdAt: Date;
  authorId: string;
}
