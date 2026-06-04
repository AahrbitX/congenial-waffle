import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  plugins: [phoneNumberClient()],
  user: {
    additionalFields: {
      role: { type: "string" },
      phone: { type: "string" },
    },
  },
  advanced: {
    cookiePrefix: "mohan-cabs",
  },
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signIn, signOut, signUp } = authClient;

/**
 * Force the session atom to re-fetch and wait until it settles.
 *
 * Better Auth's session atom only re-fetches when $sessionSignal is toggled by
 * atomListeners (which fire on /sign-in/email, /sign-up/email, etc. via the proxy).
 * Raw fetch() calls and authClient.getSession() do NOT toggle the signal, leaving
 * the atom stale after login. This helper forces an immediate signal toggle and
 * resolves once the atom has settled with the fresh session.
 *
 * Call this in login forms instead of authClient.getSession() before router.push().
 */
export function waitForSession(): Promise<any | null> {
  return new Promise((resolve) => {
    let settled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const finish = (data: any) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      unsubscribe();
      resolve(data);
    };

    // Force immediate session re-fetch (bypasses the 10ms setTimeout in proxy).
    // This must happen BEFORE we attach the listener so the atom is already
    // in-flight when we start watching it.
    (authClient as any).$store.notify("$sessionSignal");

    // Use the atom's .listen() directly instead of $store.listen().
    // $store.listen() calls nanostore's .subscribe() which fires the callback
    // synchronously with the current stale value, resolving the promise before
    // the refetch completes. .listen() only fires on subsequent *changes*.
    const sessionAtom = (authClient as any).$store.atoms.session;
    const unsubscribe = sessionAtom.listen(
      (state: { data: any; isPending: boolean; isRefetching: boolean }) => {
        if (!state.isPending && !state.isRefetching) finish(state.data);
      }
    );

    // 5s safety timeout so login never hangs
    timeout = setTimeout(() => finish(null), 5000);
  });
}
