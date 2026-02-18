import { useEffect, useState, createContext, useContext } from "react";

interface PushContextProps {
  permission: NotificationPermission;
  subscribe: () => Promise<void>;
}

const PushContext = createContext<PushContextProps | undefined>(undefined);

export const PushProvider = ({ children }: { children: React.ReactNode }) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.register("/service-worker.js");
    const perm = await Notification.requestPermission();
    setPermission(perm);
    // 실제 푸시 구독(서버 연동)은 별도 구현 필요
  };

  return (
    <PushContext.Provider value={{ permission, subscribe }}>
      {children}
    </PushContext.Provider>
  );
};

export const usePush = () => {
  const ctx = useContext(PushContext);
  if (!ctx) throw new Error("usePush must be used within PushProvider");
  return ctx;
};
