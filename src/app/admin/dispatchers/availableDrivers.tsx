"use client";

import React, { useState } from "react";
import {
  Button,
  Avatar,
  Chip,
  SearchField,
  Popover,
  cn,
  Card,
} from "@heroui/react";
import { Users } from "lucide-react";

export default function AvailableDrivers({ drivers = [] }: { drivers: any[] }) {
  return (
    <div className="flex flex-col h-full bg-content1 overflow-hidden">
      {/* Header with Search and Filter */}
      <div className="p-4 border-b border-divider flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-default-900">
            <Users size={20} className="text-accent" />
            <h3 className="font-bold">Available Drivers</h3>
          </div>
          <span className="text-xs text-muted font-medium">
            {drivers.length} found
          </span>
        </div>

        <div className="flex gap-2">
          <SearchField
            variant="secondary"
            className="flex-1"
            aria-label="Search drivers"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search by name or ID..." />
            </SearchField.Group>
          </SearchField>
          <DriverFilter />
        </div>
      </div>

      {/* Driver List Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
        {drivers.map((driver) => (
          <Card key={driver.id} className="" variant="secondary">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar color="accent" variant="soft">
                  <Avatar.Fallback>DF</Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col">
                  <h4 className="font-semibold">{driver.name}</h4>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Chip size="sm" variant="soft" color="default">
                      {driver.vehicleType}
                    </Chip>
                    <Chip size="sm" variant="soft" color="default">
                      {driver.ac ? "AC" : "No-AC"}
                    </Chip>
                    <Chip size="sm" variant="soft" color="default">
                      {driver.seats} seats
                    </Chip>
                    <Chip
                      size="sm"
                      variant="soft"
                      color="accent"
                      className="px-2"
                    >
                      ETA : {driver.eta}
                    </Chip>
                  </div>
                </div>
              </div>

              <Button variant="primary" className="">
                Assign
              </Button>
            </div>

            {/* <Separator variant="secondary" /> */}

            {/* <div className="flex items-center justify-between">
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-warning text-warning" />
                  <span className="text-sm font-bold">{driver.rating}</span>
                </div>
              </div>
            </div> */}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DriverFilter() {
  const [vehicle, setVehicle] = useState("Sedan");
  const [ac, setAc] = useState("AC");
  const [seats, setSeats] = useState("4");
  const vehicleTypes = ["Sedan", "Mini", "MPV", "SUV", "Hatchback"];
  const acTypes = ["AC", "Non-AC"];
  const seatCounts = ["4", "5", "6", "7"];

  return (
    <Popover>
      <Button variant="secondary" className="shrink-0">
        Filter
      </Button>
      <Popover.Content className="p-0 w-[320px] " placement="left top">
        <div className="flex flex-col p-4 gap-3">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-default-900">Filter Drivers</h3>
            <Button variant="ghost" size="sm">
              Reset all
            </Button>
          </div>

          {/* Vehicle Type Section */}
          <FilterSection title="Vehicle Type">
            <div className="flex flex-wrap gap-2">
              {vehicleTypes.map((type) => (
                <SelectChip
                  key={type}
                  label={type}
                  isSelected={vehicle === type}
                  onClick={() => setVehicle(type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* AC / Non-AC Section */}
          <FilterSection title="AC / Non-AC">
            <div className="flex gap-2">
              {acTypes.map((type) => (
                <SelectChip
                  key={type}
                  label={type}
                  isSelected={ac === type}
                  onClick={() => setAc(type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Min. Seats Section */}
          <FilterSection title="Min. Seats">
            <div className="flex gap-2">
              {seatCounts.map((count) => (
                <SelectChip
                  key={count}
                  label={count}
                  isSelected={seats === count}
                  onClick={() => setSeats(count)}
                  isCircle
                />
              ))}
            </div>
          </FilterSection>

          {/* Apply Action */}
          <Button
            fullWidth
            className="mt-2"
            onPress={() => console.log("Filters Applied")}
          >
            Apply Filters
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-accent">{title}</p>
      {children}
    </div>
  );
}

function SelectChip({
  label,
  isSelected,
  onClick,
  isCircle = false,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  isCircle?: boolean;
}) {
  return (
    <Chip
      onClick={onClick}
      variant="primary"
      className={cn(
        "px-3 cursor-pointer transition-all border-accent",
        isSelected
          ? "border-accent text-accent bg-accent/5 ring-1 ring-accent"
          : "text-default-500",
        isCircle
          ? "w-9 p-0 flex items-center justify-center rounded-full"
          : "rounded-full",
      )}
    >
      <span className="">{label}</span>
    </Chip>
  );
}
