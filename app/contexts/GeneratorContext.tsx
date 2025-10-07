"use client";

import React, { createContext, useContext, useState } from "react";

interface GeneratorContextType {
  generatedPassword: string | null;
  setGeneratedPassword: (password: string | null) => void;
}

const GeneratorContext = createContext<GeneratorContextType | undefined>(undefined);

export function GeneratorProvider({ children }: { children: React.ReactNode }) {
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  return (
    <GeneratorContext.Provider value={{ generatedPassword, setGeneratedPassword }}>
      {children}
    </GeneratorContext.Provider>
  );
}

export function useGenerator() {
  const context = useContext(GeneratorContext);
  if (!context) {
    throw new Error("useGenerator must be used within GeneratorProvider");
  }
  return context;
}
