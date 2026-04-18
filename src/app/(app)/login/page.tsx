"use client";

import React from "react";
import { Input, Button, Card } from "@heroui/react";
import { Car } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-[400px] p-4 shadow-lg">
        <Card.Header className="flex flex-col items-center justify-center gap-2 pb-8 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car size={28} />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-small text-default-500">
              Log in to your Mohan Cabs account
            </p>
          </div>
        </Card.Header>
        <div className="gap-4">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input placeholder="Enter your username" type="text" />
            <Input placeholder="Enter your password" type={"password"} />

            <Button
              className="mt-2 w-full font-semibold"
              size="lg"
              type="submit"
            >
              Log In
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
