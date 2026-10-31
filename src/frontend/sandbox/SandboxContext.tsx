import { createContext, useContext, useState, type ReactNode } from 'react';

interface SandboxState {
  sandbox: boolean;
  setSandbox: (on: boolean) => void;
  overlayStep: number | null;
  setOverlayStep: (step: number | null) => void;
}

const SandboxContext = createContext<SandboxState | null>(null);

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [sandbox, setSandbox] = useState(false);
  const [overlayStep, setOverlayStep] = useState<number | null>(null);

  const enable = (on: boolean) => {
    setSandbox(on);
    setOverlayStep(on ? 0 : null);
  };

  return (
    <SandboxContext.Provider value={{ sandbox, setSandbox: enable, overlayStep, setOverlayStep }}>
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox(): SandboxState {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error('useSandbox must be used inside SandboxProvider');
  return ctx;
}
