"use client";

import React from "react";
import { Button, Surface } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const router = useRouter();

  return (
    <Surface className="px-2 py-4 ">
      <div className="flex items-center justify-start gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="outline"
          onClick={() => router.back()}
        >
          <ChevronLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold">Users / {userId}</h1>
      </div>
    </Surface>
  );
}

export default UserDetailsPage;
