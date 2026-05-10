import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
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
