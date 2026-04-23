"use client";

import React from "react";
import { Button, Surface } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

function DriverProfilePage() {
  const params = useParams<{ id: string }>();
  const driverId = params.id;

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
        <h1 className="text-2xl font-bold">Drivers / {driverId}</h1>
      </div>
    </Surface>
  );
}

export default DriverProfilePage;
