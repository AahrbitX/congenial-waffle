"use client";

import { useEffect, useState } from "react";
import FleetSettings from "../FleetSettings";

export default function FleetsPage() {
  const [mounting, setMounting] = useState(true);
  useEffect(() => { setMounting(false); }, []);
  return <FleetSettings isLoading={mounting} />;
}
