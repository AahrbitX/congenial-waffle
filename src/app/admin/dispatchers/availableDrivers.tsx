"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Avatar,
  Chip,
  SearchField,
  Popover,
  cn,
  Card,
  Surface,
} from "@heroui/react";
import { Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api-client";

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  ac: boolean;
  seats: number;
  etaMin: number;
};

type SuggestedFilters = {
  vehicleType?: string;
  ac?: string;
  seats?: string;
};

type ApiResponse = {
  data: Driver[];
  filters: SuggestedFilters;
};

type Filters = {
  vehicleType?: string;
  ac?: string;
  seats?: string;
  search?: string;
};

type Props = {
  tripId: string;
};

export default function AvailableDrivers({ tripId }: Props) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<Filters>({});
  const [hydratedDefaults, setHydratedDefaults] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
    if (filters.ac) params.set("ac", filters.ac);
    if (filters.seats) params.set("seats", filters.seats);
    if (filters.search) params.set("search", filters.search);

    return params.toString();
  }, [filters]);

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["dispatcher-drivers", tripId, filters],
    queryFn: async () => {
      return request(
        `/api/dispatchers/${tripId}/drivers${
          queryString ? `?${queryString}` : ""
        }`,
        {
          method: "GET",
        },
      );
    },
    enabled: !!tripId,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!tripId) return;

    setFilters({});
    setHydratedDefaults(false);
  }, [tripId]);

  useEffect(() => {
    if (!data?.filters || hydratedDefaults) return;

    setFilters((prev) => ({
      ...prev,
      vehicleType: prev.vehicleType ?? data.filters.vehicleType,
      ac:
        prev.ac ??
        (typeof data.filters.ac === "boolean"
          ? String(data.filters.ac)
          : data.filters.ac),
      seats: prev.seats ?? data.filters.seats,
    }));

    setHydratedDefaults(true);
  }, [data, hydratedDefaults]);

  const assignMutation = useMutation({
    mutationFn: async (driverId: string) => {
      return request(`/api/dispatchers/${tripId}/assign-driver`, {
        method: "POST",
        body: JSON.stringify({ driverId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatchers"] });
      queryClient.invalidateQueries({
        queryKey: ["dispatcher-trip", tripId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dispatcher-drivers", tripId],
      });
    },
  });

  if (!tripId) {
    return (
      <div className="h-full flex items-center justify-center text-default-400">
        Select trip
      </div>
    );
  }

  const drivers = data?.data ?? [];

  return (
    <div className="flex flex-col h-full bg-content1 overflow-hidden">
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
          <SearchField variant="secondary" className="flex-1">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                placeholder="Search driver..."
                value={filters.search ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
              />
            </SearchField.Group>
          </SearchField>

          <DriverFilter filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <Surface
        variant="secondary"
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin"
      >
        {isLoading && <p>Loading...</p>}

        {!isLoading &&
          drivers.map((driver) => (
            <Card key={driver.id} variant="default">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar color="accent" variant="soft">
                    <Avatar.Fallback>
                      {driver.name.slice(0, 2).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>

                  <div>
                    <h4 className="font-semibold text-lg">{driver.name}</h4>

                    <div className="flex gap-2 mt-1 flex-wrap *:px-2 *:capitalize">
                      <Chip size="sm">{driver.vehicleType}</Chip>
                      <Chip size="sm">{driver.ac ? "AC" : "Non-AC"}</Chip>
                      <Chip size="sm">{driver.seats} seats</Chip>
                      <Chip size="sm" color="accent">
                        ETA {driver.etaMin} min
                      </Chip>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onPress={() => assignMutation.mutate(driver.id)}
                >
                  Assign
                </Button>
              </div>
            </Card>
          ))}

        {!isLoading && drivers.length === 0 && (
          <div className="text-sm text-default-400 text-center py-8">
            No matching drivers found
          </div>
        )}
      </Surface>
    </div>
  );
}

function DriverFilter({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const vehicleTypes = ["sedan", "suv", "minivan"];
  const seatCounts = ["4", "5", "6", "7"];

  return (
    <Popover>
      <Button variant="secondary">Filter</Button>

      <Popover.Content className="p-0 w-[320px]" placement="left top">
        <div className="flex flex-col p-4 gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Filter Drivers</h3>

            <Button
              variant="ghost"
              size="sm"
              onPress={() =>
                setFilters((prev) => ({
                  search: prev.search,
                }))
              }
            >
              Reset
            </Button>
          </div>

          <FilterSection title="Vehicle Type">
            <div className="flex flex-wrap gap-2">
              {vehicleTypes.map((item) => (
                <SelectChip
                  key={item}
                  label={item}
                  isSelected={filters.vehicleType === item}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      vehicleType: prev.vehicleType === item ? undefined : item,
                    }))
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="AC">
            <div className="flex gap-2">
              {[
                { label: "AC", value: "true" },
                { label: "Non-AC", value: "false" },
              ].map((item) => (
                <SelectChip
                  key={item.value}
                  label={item.label}
                  isSelected={filters.ac === item.value}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      ac: prev.ac === item.value ? undefined : item.value,
                    }))
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Seats">
            <div className="flex gap-2 flex-wrap">
              {seatCounts.map((item) => (
                <SelectChip
                  key={item}
                  label={item}
                  isSelected={filters.seats === item}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      seats: prev.seats === item ? undefined : item,
                    }))
                  }
                />
              ))}
            </div>
          </FilterSection>
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
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Chip
      onClick={onClick}
      className={cn(
        "px-3 cursor-pointer border-accent",
        isSelected
          ? "border-accent text-accent bg-accent/5 ring-1 ring-accent"
          : "text-default-500",
      )}
    >
      {label}
    </Chip>
  );
}
