"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Label } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { waitForSession } from "@/lib/auth-client";

export default function PasswordLoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = `${phoneNumber}@mohan-cabs.com`;

      const response = await fetch(`/api/auth/sign-in/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Force the session atom to re-fetch and wait for it to settle.
      // Raw fetch() bypasses the proxy so atomListeners never fire — calling
      // waitForSession() triggers $sessionSignal directly so useSession() in
      // the layout has the data before we navigate.
      const session = await waitForSession();
      const role = (session?.user as any)?.role;
      // Mirror role into a plain cookie so Next.js middleware can route without a DB call
      document.cookie = `mohan-cabs.user_role=${role === "admin" ? "admin" : "user"}; path=/; SameSite=Lax`;
      const redirect = searchParams.get("redirect");
      const defaultDest = role === "admin" ? "/admin" : "/dashboard/overview";
      const dest = redirect?.startsWith("/") ? redirect : defaultDest;
      router.push(`/redirecting?to=${encodeURIComponent(dest)}`);
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleLogin}>
      <div className="px-1">
        <Label htmlFor="phone" className="">
          Phone Number
        </Label>
        <Input
          id="phone"
          variant="secondary"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          className="mt-2 w-full"
          placeholder="+91 XXXXX XXXXX"
          type="tel"
          disabled={loading}
        />
      </div>
      <div className="px-1">
        <Label htmlFor="password" className="">
          Password
        </Label>
        <Input
          id="password"
          variant="secondary"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full"
          placeholder="••••••••"
          type="password"
          disabled={loading}
        />
      </div>
      {error && <div className="text-center text-danger">{error}</div>}
      <Button
        className="w-full "
        size="lg"
        type="submit"
        isLoading={loading}
        disabled={loading}
      >
        Sign In
      </Button>{" "}
      <p className="text-center text-xs text-[var(--color-text-tertiary)]">
        By continuing, you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-2 hover:text-primary transition-colors"
        >
          Terms &amp; Conditions
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline underline-offset-2 hover:text-primary transition-colors"
        >
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
