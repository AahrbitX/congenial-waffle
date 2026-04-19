"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";

function ProfilePage() {
  const user = authClient.useSession().data?.user;
  return (
    <main className="max-w-7xl w-full mx-auto min-h-screen p-4">
      <h1 id="book-a-ride-now" className="text-3xl font-semibold text-center">
        ProfilePage
      </h1>
      <div>{JSON.stringify(user, null, 2)}</div>
    </main>
  );
}

export default ProfilePage;
