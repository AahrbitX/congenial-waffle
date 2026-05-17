"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { LoginModal } from "@/components/auth/LoginModal";

interface AuthContextValue {
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextValue>({
  requireAuth: (action) => action(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const requireAuth = useCallback((action: () => void) => {
    if (session?.user) {
      action();
      return;
    }
    pendingAction.current = action;
    setIsOpen(true);
  }, [session]);

  const onAuthSuccess = useCallback(() => {
    setIsOpen(false);
    pendingAction.current?.();
    pendingAction.current = null;
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
    pendingAction.current = null;
  }, []);

  return (
    <AuthContext.Provider value={{ requireAuth }}>
      {children}
      {isOpen && <LoginModal isOpen={isOpen} onClose={onClose} onSuccess={onAuthSuccess} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
