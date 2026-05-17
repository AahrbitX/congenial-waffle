"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@heroui/react";
import { Button } from "@/components/ui/Button";

export default function PasswordLoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = `${phoneNumber}@mohan-cabs.com`;

      const response = await fetch("http://localhost:4000/api/auth/sign-in/email", {
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

      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard/overview");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleLogin}>
      <div>
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
      <div>
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
      <Button className="w-full " size="lg" type="submit" isLoading={loading} disabled={loading}>
        Sign In
      </Button>
    </form>
  );
}
