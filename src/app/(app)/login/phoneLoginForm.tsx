"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { OtpLoginFlow } from "@/components/auth/OtpLoginFlow";

export default function PhoneLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSuccess = (user?: any) => {
    // Mirror role into a plain cookie so Next.js middleware can route without a DB call
    if (user?.role === "admin") {
      document.cookie = "mohan-cabs.user_role=admin; path=/; SameSite=Lax";
    } else {
      document.cookie = "mohan-cabs.user_role=user; path=/; SameSite=Lax";
    }
    const redirect = searchParams.get("redirect");
    const defaultDest = user?.role === "admin" ? "/admin" : "/dashboard/overview";
    // Validate redirect starts with "/" to prevent open redirect to external URLs
    const dest = redirect?.startsWith("/") ? redirect : defaultDest;
    router.push(`/redirecting?to=${encodeURIComponent(dest)}`);
  };

  return <OtpLoginFlow onSuccess={handleSuccess} />;
}
