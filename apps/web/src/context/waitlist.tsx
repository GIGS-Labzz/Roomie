"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { WaitlistModal } from "@/components/WaitlistModal";

interface WaitlistContextValue {
  openWaitlist: () => void;
}

const WaitlistContext = createContext<WaitlistContextValue>({ openWaitlist: () => {} });

export function useWaitlist() {
  return useContext(WaitlistContext);
}

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openWaitlist = useCallback(() => setOpen(true), []);

  return (
    <WaitlistContext.Provider value={{ openWaitlist }}>
      {children}
      <WaitlistModal open={open} onClose={() => setOpen(false)} />
    </WaitlistContext.Provider>
  );
}
