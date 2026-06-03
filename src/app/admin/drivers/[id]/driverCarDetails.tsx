"use client";

import React from "react";
import { Tabs } from "@heroui/react";

type CarDetailsProps = {
  vehicleType: string;
  vehicleNumber: string;
  ac: boolean;
  isAvailable: boolean;
};

function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function DriverCarDetailsTab({ vehicle }: { vehicle: CarDetailsProps }) {
  return (
    <Tabs.Panel className="pt-2 px-0" id="car-details">
      <div className="rounded-xl border border-border bg-surface px-4">
        <DetailRow label="Vehicle Type" value={<span className="capitalize">{vehicle.vehicleType}</span>} />
        <DetailRow label="Vehicle Number" value={vehicle.vehicleNumber ?? "—"} />
        <DetailRow
          label="AC"
          value={
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${vehicle.ac ? "bg-success/15 text-success" : "bg-default/60 text-muted"}`}>
              {vehicle.ac ? "AC" : "Non-AC"}
            </span>
          }
        />
        <DetailRow
          label="Availability"
          value={
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${vehicle.isAvailable ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
              {vehicle.isAvailable ? "Available" : "Unavailable"}
            </span>
          }
        />
      </div>
    </Tabs.Panel>
  );
}
