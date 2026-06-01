"use client";

import { useEffect, useState } from "react";
import PricingSettings from "../PricingSettings";

export default function PricingPage() {
  const [mounting, setMounting] = useState(true);
  useEffect(() => { setMounting(false); }, []);
  return <PricingSettings isLoading={mounting} />;
}
