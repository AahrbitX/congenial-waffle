"use client";

import React from "react";
import { Description, Surface } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

function AdminPage() {
  const { data } = authClient.useSession();

  return (
    <Surface className="h-full min-h-0 p-4" variant="secondary">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome Back, {data?.user.name || "Admin"}
        </h1>
        <Description>
          Here's what's happening with Mohan Cabs today.
        </Description>
      </div>
    </Surface>
  );
}

export default AdminPage;
