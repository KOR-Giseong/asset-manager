"use client";
import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DangerZoneModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "reset" | "delete";
}

export const DangerZoneModal: FC<DangerZoneModalProps> = ({ open, onClose, onConfirm, type }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{type === "reset" ? "전체 데이터 초기화" : "서비스 탈퇴"}</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        {type === "reset"
          ? "정말 모든 자산/이력/설정 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          : "정말 서비스 탈퇴 및 모든 데이터를 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>취소</Button>
        <Button variant="destructive" onClick={onConfirm}>확인</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
