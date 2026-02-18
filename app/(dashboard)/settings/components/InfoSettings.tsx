"use client";
import { FC } from "react";
import Link from "next/link";

export const InfoSettings: FC = () => (
  <div className="space-y-4">
    <div>
      <span className="font-medium">버전</span>: v1.0.0
    </div>
    <div>
      <Link href="/board" className="text-primary underline">공지사항/패치노트 바로가기</Link>
    </div>
  </div>
);
