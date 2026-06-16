"use client";

import { authClient } from "@/lib/auth-client";
import PersonalInfo from "./PersonalInfo";

export default function PersonalInfoPage() {
  const { data: session, isPending } = authClient.useSession();
  return <PersonalInfo isLoading={isPending} user={session?.user} />;
}
