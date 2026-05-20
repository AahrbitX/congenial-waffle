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
