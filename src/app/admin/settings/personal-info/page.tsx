"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import PersonalInfo from "../PersonalInfo";

export default function PersonalInfoPage() {
  const { data: session, isPending } = authClient.useSession();
  const [mounting, setMounting] = useState(true);
  useEffect(() => { setMounting(false); }, []);
  return <PersonalInfo isLoading={mounting || isPending} user={session?.user} />;
}
