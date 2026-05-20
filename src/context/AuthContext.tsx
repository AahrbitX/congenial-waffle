"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { LoginModal } from "@/components/auth/LoginModal";

interface AuthContextValue {
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextValue>({
  requireAuth: (action) => action(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const requireAuth = useCallback((action: () => void) => {
    if (isPending) {
      // Session still loading — store it and let the effect below decide
      pendingAction.current = action;
      return;
    }
    if (session?.user) {
      action();
      return;
    }
    pendingAction.current = action;
    setIsOpen(true);
  }, [session, isPending]);

  // Once the session finishes loading, re-evaluate any stored pending action
  useEffect(() => {
    if (isPending || !pendingAction.current) return;
    const action = pendingAction.current;
    pendingAction.current = null;
    if (session?.user) {
      action();
    } else {
      setIsOpen(true);
    }
  }, [isPending, session]);

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
