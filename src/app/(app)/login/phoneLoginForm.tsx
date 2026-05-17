"use client";

import { useRouter } from "next/navigation";
import { OtpLoginFlow } from "@/components/auth/OtpLoginFlow";

export default function PhoneLoginForm() {
  const router = useRouter();
  return (
    <OtpLoginFlow onSuccess={() => router.push("/dashboard/overview")} />
  );
}
