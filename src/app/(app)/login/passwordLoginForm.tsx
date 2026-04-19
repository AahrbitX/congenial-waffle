"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input, Button, Label } from "@heroui/react";

export default function PasswordLoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, error } = await authClient.signIn.email({
      email: `${phoneNumber}@mohan-cabs.com`,
      password: password,
    });

    if (error) {
      setError(error.message || "Login failed. Please try again.");
      return;
    }

    const user = data?.user as any;
    const role = user?.role;

    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
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
          onChange={(event) => setPhoneNumber(event.target.value)}
          className="mt-2 w-full"
          placeholder="+91 XXXXX XXXXX"
          type="tel"
        />
      </div>
      <div>
        <Label htmlFor="password" className="">
          Password
        </Label>
        <Input
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full"
          placeholder="••••••••"
          type="password"
        />
      </div>
      {error && <div className="text-center text-danger">Invalid password</div>}
      <Button className="w-full " size="lg" type="submit">
        Sign In
      </Button>
    </form>
  );
}
