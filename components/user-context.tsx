"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@/types/user";

interface UserContextValue {
  user: User | null;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ initialUser, children }: { initialUser: User; children: ReactNode }) {
  const [user, setUser] = useState<User>(initialUser);
  // 서버에서 받은 최신 유저 정보로 context 초기화
  useEffect(() => { setUser(initialUser); }, [initialUser]);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
