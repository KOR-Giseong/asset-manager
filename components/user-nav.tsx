"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-foreground">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      {user.image ? (
        <img
          src={user.image}
          alt={user.name || "프로필"}
          className="h-9 w-9 rounded-full border border-border"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {user.name?.[0] || "U"}
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
