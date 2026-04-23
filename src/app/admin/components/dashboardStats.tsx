"use client";

import React from "react";
import { Card } from "@heroui/react";
import { Car, XCircle, CheckCircle, Wallet } from "lucide-react";

const stats = [
  { label: "Total Rides", value: "1,284", icon: Car, color: "text-primary" },
  {
    label: "Cancelled Rides",
    value: "56",
    icon: XCircle,
    color: "text-danger",
  },
  {
    label: "Active Rides",
    value: "43",
    icon: CheckCircle,
    color: "text-success",
  },
  {
    label: "Total Earning",
    value: "₹84K",
    icon: Wallet,
    color: "text-warning",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-none bg-content1">
          <Card.Content className="flex flex-col gap-2 p-4">
            <stat.icon className={`${stat.color} w-6 h-6`} />
            <p className="text-small text-default-500">{stat.label}</p>
            <h4 className="text-2xl font-bold">{stat.value}</h4>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
