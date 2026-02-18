import * as React from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, className }) => (
  <HeadlessSwitch
    checked={checked}
    onChange={onCheckedChange}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition",
      checked ? "bg-primary" : "bg-muted",
      className
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition",
        checked ? "translate-x-6" : "translate-x-1"
      )}
    />
  </HeadlessSwitch>
);
