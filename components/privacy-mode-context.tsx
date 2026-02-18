import React, { createContext, useContext, useState, ReactNode } from "react";

interface PrivacyModeContextProps {
  isPrivacyMode: boolean;
  setPrivacyMode: (value: boolean) => void;
}

const PrivacyModeContext = createContext<PrivacyModeContextProps | undefined>(undefined);

export const PrivacyModeProvider = ({ children }: { children: ReactNode }) => {
  const [isPrivacyMode, setPrivacyMode] = useState(false);

  return (
    <PrivacyModeContext.Provider value={{ isPrivacyMode, setPrivacyMode }}>
      {children}
    </PrivacyModeContext.Provider>
  );
};

export const usePrivacyMode = () => {
  const context = useContext(PrivacyModeContext);
  if (!context) {
    throw new Error("usePrivacyMode must be used within a PrivacyModeProvider");
  }
  return context;
};
