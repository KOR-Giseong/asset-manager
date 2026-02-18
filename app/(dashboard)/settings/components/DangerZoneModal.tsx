"use client";
import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

interface DangerZoneModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "reset" | "delete";
}

export const DangerZoneModal: FC<DangerZoneModalProps> = ({ open, onClose, onConfirm, type }) => {
  const isDelete = type === "delete";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-destructive/10">
              <TriangleAlert size={18} className="text-destructive" />
            </div>
            <DialogTitle className="text-destructive">
              {isDelete ? "서비스 탈퇴" : "전체 데이터 초기화"}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-muted-foreground">
          {isDelete
            ? "계정 및 모든 데이터가 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
            : "모든 자산, 거래 이력, 설정 데이터가 초기화됩니다. 이 작업은 되돌릴 수 없습니다."}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {isDelete ? "탈퇴하기" : "초기화하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
