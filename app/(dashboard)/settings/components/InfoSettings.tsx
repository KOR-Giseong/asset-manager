"use client";
import { FC } from "react";
import Link from "next/link";
import { ExternalLink, Tag } from "lucide-react";

export const InfoSettings: FC = () => (
  <div className="space-y-8 max-w-lg">
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-1">앱 정보</h3>
      <p className="text-xs text-muted-foreground mb-4">현재 버전 및 업데이트 정보를 확인합니다.</p>
      <div className="space-y-2">
        <div className="rounded-lg border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-muted">
              <Tag size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">현재 버전</p>
              <p className="text-xs text-muted-foreground">Asset Manager</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">
            v1.0.0
          </span>
        </div>

        <Link
          href="/board"
          className="rounded-lg border px-4 py-3 flex items-center justify-between group hover:bg-muted/50 transition-colors"
        >
          <div>
            <p className="text-sm font-medium">공지사항 / 패치노트</p>
            <p className="text-xs text-muted-foreground">업데이트 내역 및 공지를 확인합니다.</p>
          </div>
          <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>
    </div>
  </div>
);
