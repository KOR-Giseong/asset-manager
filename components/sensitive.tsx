import { ReactNode } from "react";
import { usePrivacyMode } from "@/components/privacy-mode-context";

interface SensitiveProps {
  children: ReactNode;
  mask?: ReactNode;
}

/**
 * 민감 정보(잔액, 금액 등) 표시/숨김을 전역 privacyMode에 따라 제어하는 컴포넌트
 * 기본 마스킹은 ****, mask prop으로 커스텀 가능
 */
export const Sensitive: React.FC<SensitiveProps> = ({ children, mask = <span className="select-none tracking-widest">****</span> }) => {
  const { isPrivacyMode } = usePrivacyMode();
  return <>{isPrivacyMode ? mask : children}</>;
};
