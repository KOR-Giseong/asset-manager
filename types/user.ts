export type UserRole = "USER" | "ADMIN";
export type Currency = "KRW" | "USD" | "JPY";
export type Language = "KO" | "EN" | "JP";

export interface User {
  id: string;
  email?: string;
  nickname: string;
  role: UserRole;
  baseCurrency: Currency;
  isPrivacyMode: boolean;
  language: Language;
  allowNotifications: boolean;
}
