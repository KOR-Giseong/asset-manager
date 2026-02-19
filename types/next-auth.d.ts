import type { UserRole, Currency, Language } from "@/types/user";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    nickname?: string;
    baseCurrency?: Currency;
    isPrivacyMode?: boolean;
    language?: Language;
    allowNotifications?: boolean;
    suspended?: boolean;
    suspendedReason?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      suspended: boolean;
      suspendedReason?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    nickname?: string;
    baseCurrency?: Currency;
    isPrivacyMode?: boolean;
    language?: Language;
    allowNotifications?: boolean;
    suspended?: boolean;
    suspendedReason?: string | null;
  }
}
