"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Drawer, Input, Badge, Separator } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import {
  UserPlus,
  Search,
  AlertTriangle,
  Car,
  CheckCircle2,
} from "lucide-react";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "@heroui/react";
import UserAvatar from "@/components/user/avatar";

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  ac: boolean;
  vehicleNumber: string;
  isAvailable: boolean;
  hasConflict: boolean;
};

type SuggestedDriversResponse = {
  filters: { vehicleType: string; ac: boolean; seats: number };
  data: Driver[];
};

type Props = {
  bookingId: string;
  /** When true, renders only the Drawer (no trigger button) — caller controls open state */
  isOpen?: boolean;
  onClose?: () => void;
};

function DriverCard({
  driver,
  selected,
  onSelect,
}: {
  driver: Driver;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-3 transition-all ${
        selected
          ? "border-accent bg-accent/5"
          : driver.hasConflict
            ? "border-warning/40 bg-warning/5 hover:border-warning/60"
            : "border-divider hover:border-accent/40 hover:bg-surface-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        <UserAvatar
          username={driver.name}
          color={driver.hasConflict ? "warning" : "default"}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">
              {driver.name || "—"}
            </p>
            {driver.hasConflict && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded-full shrink-0">
                <AlertTriangle size={9} /> Conflict
              </span>
            )}
            {!driver.isAvailable && !driver.hasConflict && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted bg-default/30 px-1.5 py-0.5 rounded-full shrink-0">
                Unavailable
              </span>
            )}
          </div>
          <p className="text-xs text-muted truncate">{driver.phone}</p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-xs font-semibold capitalize">
            {driver.vehicleType}
          </p>
          <p className="text-[10px] text-muted">
            {driver.vehicleNumber} · {driver.ac ? "AC" : "Non-AC"}
          </p>
        </div>
        {selected && (
          <CheckCircle2 size={18} className="text-accent shrink-0" />
        )}
      </div>
    </button>
  );
}

function AssignDriverDrawer({
  bookingId,
  isOpen,
  onClose,
}: {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<SuggestedDriversResponse>({
    queryKey: ["dispatcher-drivers", bookingId, search],
    queryFn: () =>
      request(
        `/api/dispatchers/${bookingId}/drivers?search=${encodeURIComponent(search)}`,
        { method: "GET" },
      ),
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: (driverId: string) =>
      request(`/api/dispatchers/${bookingId}/assign-driver`, {
        method: "POST",
        body: JSON.stringify({ driverId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      toast.success("Driver assigned successfully");
      onClose();
    },
    onError: (err: any) => {
      toast(`Failed to assign driver: ${err?.message ?? "Unknown error"}`, {
        variant: "danger",
      });
    },
  });

  const drivers = data?.data ?? [];

  const filtered = search
    ? drivers.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.vehicleNumber.toLowerCase().includes(search.toLowerCase()),
      )
    : drivers;

  const available = filtered.filter((d) => !d.hasConflict);
  const withConflict = filtered.filter((d) => d.hasConflict);

  return (
    <Drawer isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="w-full max-w-md">
            <Drawer.Handle />
            <Drawer.CloseTrigger />

            <Drawer.Header>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <UserPlus size={16} className="text-accent" />
                </div>
                <div>
                  <Drawer.Heading className="text-base font-bold">
                    Assign Driver
                  </Drawer.Heading>
                  <p className="text-xs text-muted">
                    Select a driver for this booking
                  </p>
                </div>
              </div>
            </Drawer.Header>

            <Separator />

            <div className="px-4 pt-3 pb-2 relative">
              <Search
                size={14}
                className="text-muted absolute left-7 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <Input
                placeholder="Search by name or vehicle number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                variant="secondary"
                className="pl-8"
              />
            </div>

            <Drawer.Body className="px-4 pb-4 space-y-4 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-surface-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <Car size={32} className="text-muted opacity-40" />
                  <p className="text-sm font-semibold">No drivers found</p>
                  <p className="text-xs text-muted">
                    Try adjusting your search
                  </p>
                </div>
              ) : (
                <>
                  {available.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-muted uppercase tracking-widest">
                        Available ({available.length})
                      </p>
                      {available.map((d) => (
                        <DriverCard
                          key={d.id}
                          driver={d}
                          selected={selectedId === d.id}
                          onSelect={() =>
                            setSelectedId((prev) =>
                              prev === d.id ? null : d.id,
                            )
                          }
                        />
                      ))}
                    </div>
                  )}

                  {withConflict.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle size={11} className="text-warning" />
                        Schedule Conflict ({withConflict.length})
                      </p>
                      {withConflict.map((d) => (
                        <DriverCard
                          key={d.id}
                          driver={d}
                          selected={selectedId === d.id}
                          onSelect={() =>
                            setSelectedId((prev) =>
                              prev === d.id ? null : d.id,
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </Drawer.Body>

            <Separator />

            <Drawer.Footer className="px-4 py-3 flex gap-2">
              <Button
                variant="outline"
                fullWidth
                onPress={onClose}
                isDisabled={assignMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                isDisabled={!selectedId || assignMutation.isPending}
                isLoading={assignMutation.isPending}
                onPress={() => selectedId && assignMutation.mutate(selectedId)}
              >
                <UserPlus size={15} />
                Assign Driver
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

/** Standalone trigger button — used in the bookings table */
function AssignDriver({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="tertiary" onPress={() => setOpen(true)}>
        <UserPlus size={16} />
        Assign Driver
      </Button>
      <AssignDriverDrawer
        bookingId={bookingId}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export { AssignDriverDrawer };
export default AssignDriver;
