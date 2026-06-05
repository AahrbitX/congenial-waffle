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
  Skeleton,
  toast,
} from "@heroui/react";
import { Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api-client";
import { Button as CustomButton } from "@/components/ui/Button";

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  ac: boolean;
  isAvailable: boolean;
  hasConflict: boolean;
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
  pageLoading?: boolean;
};

export default function AvailableDrivers({ tripId, pageLoading }: Props) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<Filters>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
    if (filters.ac) params.set("ac", filters.ac);
    if (filters.seats) params.set("seats", filters.seats);
    if (filters.search) params.set("search", filters.search);

    return params.toString();
  }, [filters]);

  const { data, isLoading, isError } = useQuery<ApiResponse>({
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
  }, [tripId]);

  // Suggested filters from the booking — stored but NOT auto-applied.
  // Dispatcher can tap "Match Trip" to apply them.
  const suggestedFilters = data?.filters;

  const assignMutation = useMutation({
    mutationFn: async (driverId: string) => {
      setAssigningId(driverId);
      return request(`/api/dispatchers/${tripId}/assign-driver`, {
        method: "POST",
        body: JSON.stringify({ driverId }),
      });
    },
    onSuccess: () => {
      setAssigningId(null);
      toast.success("Driver assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["dispatchers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher-trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher-drivers", tripId] });
    },
    onError: () => {
      setAssigningId(null);
      toast("Failed to assign driver", { variant: "danger" });
    },
  });

  if (!tripId) {
    if (pageLoading) return <DriversPanelSkeleton />;
    return (
      <div className="h-full flex items-center justify-center px-6 text-center text-default-400">
        <div className="space-y-2">
          <p className="text-lg font-semibold">Select a Trip</p>
          <p className="text-sm">Choose a trip from the queue to assign a driver.</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return <EmptyState message="Failed to load drivers" danger />;
  }

  const drivers = data?.data ?? [];

  return (
    <div className="flex flex-col h-full bg-content1 overflow-hidden">
      <div className="p-4 border-b border-divider flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-default-900">
            <Users size={20} className="text-accent" />
            <h3 className="font-bold">All Drivers</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">
              {drivers.length} drivers
            </span>
            {suggestedFilters && (
              <Button
                size="sm"
                variant="secondary"
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    vehicleType: suggestedFilters.vehicleType,
                    ac: String(suggestedFilters.ac),
                  }))
                }
              >
                Match Trip
              </Button>
            )}
          </div>
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
        variant="tertiary"
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 scrollbar-thin"
      >
        {isLoading && (
          <>
            <DriverCardSkeleton />
            <DriverCardSkeleton />
            <DriverCardSkeleton />
            <DriverCardSkeleton />
          </>
        )}

        {!isLoading &&
          drivers.map((driver) => (
            <Card
              key={driver.id}
              variant="default"
              className={cn(
                "py-3 px-4",
                driver.hasConflict && "border-warning/40 bg-warning/5",
              )}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar
                  size="sm"
                  color={driver.hasConflict ? "warning" : "accent"}
                  variant="soft"
                  className="shrink-0"
                >
                  <Avatar.Fallback className="text-xs font-bold">
                    {driver.name.slice(0, 2).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>

                {/* Info block */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight truncate">
                    {driver.name}
                  </p>

                  {/* Status badge — only when flagged */}
                  {(driver.hasConflict || !driver.isAvailable) && (
                    <div className="mt-0.5">
                      {driver.hasConflict ? (
                        <Chip size="sm" color="warning" variant="soft" className="text-[11px]">
                          Same-day ride
                        </Chip>
                      ) : (
                        <Chip size="sm" color="danger" variant="soft" className="text-[11px]">
                          Marked busy
                        </Chip>
                      )}
                    </div>
                  )}

                  {/* Attribute chips */}
                  <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
                    <Chip size="sm" className="shrink-0 capitalize px-2 text-[11px]">
                      {driver.vehicleType}
                    </Chip>
                    <Chip size="sm" className="shrink-0 px-2 text-[11px]">
                      {driver.ac ? "AC" : "Non-AC"}
                    </Chip>
                    {driver.vehicleNumber && (
                      <Chip size="sm" className="px-2 text-[11px] max-w-[100px] truncate">
                        {driver.vehicleNumber}
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Assign button */}
                <CustomButton
                  size="sm"
                  variant={driver.hasConflict ? "secondary" : "primary"}
                  onPress={() => assignMutation.mutate(driver.id)}
                  isLoading={assigningId === driver.id}
                  isDisabled={assignMutation.isPending}
                  className="shrink-0"
                >
                  Assign
                </CustomButton>
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

function DriversPanelSkeleton() {
  return (
    <div className="flex flex-col h-full bg-content1 overflow-hidden">
      <div className="p-4 border-b border-divider flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      <Surface variant="tertiary" className="flex-1 p-3 flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <DriverCardSkeleton key={i} />
        ))}
      </Surface>
    </div>
  );
}

function DriverCardSkeleton() {
  return (
    <Card variant="default">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-40 rounded-md" />

            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </Card>
  );
}

function EmptyState({
  message,
  danger,
}: {
  message: string;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-full flex items-center justify-center text-sm",
        danger ? "text-danger" : "text-default-400",
      )}
    >
      {message}
    </div>
  );
}
