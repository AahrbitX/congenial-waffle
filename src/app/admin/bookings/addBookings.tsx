"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import {
  cn,
  Description,
  Modal,
  ModalBackdrop,
  Separator,
  Input,
  TextField,
  Label,
  FieldError,
  ComboBox,
  ListBox,
  Select,
  TextArea,
  toast,
} from "@heroui/react";
import { Button } from "@/components/ui/Button";
import CustomRadioGroup from "@/components/form/customRadioGroup";
import { LocationSearchInput } from "@/components/form/LocationSearchInput";
import { useMutation } from "@tanstack/react-query";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { useVehicles } from "@/hooks/useBooking";
import { formatFare, getVehicleFare } from "@/data/booking.mock";
import { toBackendVehicleType } from "@/api/booking.api";
import { getRouteDistance } from "@/utils/geocoding";
import type { Vehicle } from "@/types/booking.types";

type BookingFormData = {
  customerName:  string;
  customerPhone: string;
  bookingFor:    string;
  serviceType:   string;   // local | outstation | airport
  tripType:      string;   // oneway | roundtrip
  pickup:        string;
  pickupZone:    string;
  pickupLat:     string;
  pickupLng:     string;
  drop:          string;
  dropZone:      string;
  dropLat:       string;
  dropLng:       string;
  tripDate:      string;
  tripTime:      string;
  returnDate:    string;
  returnTime:    string;
  vehicleType:   string;
  seatsRequired: string;
  acPreference:  string;
  totalFare:     string;
  notes:         string;
};

const initialFormData: BookingFormData = {
  customerName:  "",
  customerPhone: "",
  bookingFor:    "self",
  serviceType:   "local",
  tripType:      "oneway",
  pickup:        "",
  pickupZone:    "",
  pickupLat:     "",
  pickupLng:     "",
  drop:          "",
  dropZone:      "",
  dropLat:       "",
  dropLng:       "",
  tripDate:      "",
  tripTime:      "",
  returnDate:    "",
  returnTime:    "",
  vehicleType:   "",
  seatsRequired: "4",
  acPreference:  "ac",
  totalFare:     "",
  notes:         "",
};

function AddBookings({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  const [step, setStep]         = useState<number>(1);
  const [isOpen, setIsOpen]     = useState<boolean>(false);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const { data: vehicles = [] }  = useVehicles();

  // Recalculate road distance whenever both sets of coordinates change
  useEffect(() => {
    const pLat = Number(formData.pickupLat);
    const pLng = Number(formData.pickupLng);
    const dLat = Number(formData.dropLat);
    const dLng = Number(formData.dropLng);
    if (!pLat || !pLng || !dLat || !dLng) { setDistanceKm(null); return; }
    getRouteDistance(pLat, pLng, dLat, dLng).then(setDistanceKm);
  }, [formData.pickupLat, formData.pickupLng, formData.dropLat, formData.dropLng]);

  const updateField = (field: keyof BookingFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Auto-fill totalFare when vehicle changes (use defaultFare as starting point)
  const handleVehicleChange = (value: string) => {
    updateField("vehicleType", value);
    const vehicle = vehicles.find((v) => v.type === value);
    if (vehicle && !formData.totalFare) {
      const fare = getVehicleFare(vehicle);
      updateField("totalFare", String(fare.amount));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const isRoundTrip = data.tripType === "roundtrip";
      const payload: Record<string, unknown> = {
        customerName:  data.customerName,
        customerPhone: data.customerPhone,
        source:        "admin",
        serviceType:   data.serviceType,
        pickupName:    data.pickup,
        pickupZone:    data.pickupZone,
        dropName:      data.drop,
        dropZone:      data.dropZone,
        journeyDate:   data.tripDate,
        journeyTime:   data.tripTime,
        tripType:      data.tripType,
        returnDate:    isRoundTrip ? data.returnDate : undefined,
        returnTime:    isRoundTrip ? data.returnTime : undefined,
        members:       Number(data.seatsRequired),
        vehicleType:   toBackendVehicleType(data.vehicleType),
        ac:            data.acPreference === "ac",
        totalFare:     data.totalFare || "0.00",
        notes:         data.notes || undefined,
      };
      if (data.pickupLat && data.pickupLng) {
        payload.pickupLat = Number(data.pickupLat);
        payload.pickupLng = Number(data.pickupLng);
      }
      if (data.dropLat && data.dropLng) {
        payload.dropLat = Number(data.dropLat);
        payload.dropLng = Number(data.dropLng);
      }
      return request("/api/bookings/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setIsOpen(false);
      setFormData(initialFormData);
      setStep(1);
      toast.success("Booking created — cash payment marked collected");
    },
    onError: () => {
      toast.danger("Failed to create booking");
    },
  });

  const canProceedStep1 =
    formData.customerName.trim() &&
    formData.customerPhone.trim() &&
    formData.pickup.trim() &&
    formData.drop.trim();

  const isRoundTrip = formData.tripType === "roundtrip";
  const canProceedStep2 =
    formData.tripDate && formData.tripTime && formData.vehicleType &&
    (!isRoundTrip || (formData.returnDate && formData.returnTime));

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setFormData(initialFormData); setStep(1); } }}>
      <Button
        size="sm"
        variant="primary"
        isIconOnly={iconOnly}
        className={cn("", className)}
        onPress={() => setIsOpen(true)}
      >
        <Plus size={16} />
        {!iconOnly && "Add Booking"}
      </Button>

      <ModalBackdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />

            <Modal.Header className="gap-1">
              <Modal.Heading>Add New Booking</Modal.Heading>
              <Description>
                Step {step} of 3 —{" "}
                {step === 1 ? "Passenger & Route" : step === 2 ? "Vehicle & Schedule" : "Fare & Confirm"}
              </Description>
            </Modal.Header>

            <Separator className="my-4" />

            <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {step === 1 && <StepOne data={formData} onChange={updateField} />}
              {step === 2 && (
                <StepTwo
                  data={formData}
                  vehicles={vehicles}
                  onChange={updateField}
                  onVehicleChange={handleVehicleChange}
                />
              )}
              {step === 3 && (
                <StepThree
                  data={formData}
                  vehicles={vehicles}
                  distanceKm={distanceKm}
                  onChange={updateField}
                />
              )}
            </div>

            <Separator className="my-4" />

            <Modal.Footer>
              {step === 1 && (
                <Button fullWidth isDisabled={!canProceedStep1} onPress={() => setStep(2)}>
                  Next: Vehicle & Schedule
                </Button>
              )}
              {step === 2 && (
                <>
                  <Button variant="secondary" fullWidth onPress={() => setStep(1)}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button fullWidth isDisabled={!canProceedStep2} onPress={() => setStep(3)}>
                    Next: Fare & Confirm
                  </Button>
                </>
              )}
              {step === 3 && (
                <>
                  <Button variant="secondary" fullWidth onPress={() => setStep(2)}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button
                    fullWidth
                    isDisabled={mutation.isPending || !formData.totalFare}
                    isLoading={mutation.isPending}
                    onPress={() => mutation.mutate(formData)}
                  >
                    Confirm & Create Booking
                  </Button>
                </>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </ModalBackdrop>
    </Modal>
  );
}

/* ── Step 1: Passenger & Route ───────────────────────────────────────────── */
interface StepProps {
  data: BookingFormData;
  onChange: (field: keyof BookingFormData, value: string) => void;
}

function StepOne({ data, onChange }: StepProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TextField isRequired name="customerName">
        <Label>Passenger Name</Label>
        <Input variant="secondary" value={data.customerName}
          onChange={(e) => onChange("customerName", e.target.value)} placeholder="Full name" />
        <FieldError />
      </TextField>

      <TextField isRequired name="customerPhone">
        <Label>Mobile Number</Label>
        <Input variant="secondary" value={data.customerPhone}
          onChange={(e) => onChange("customerPhone", e.target.value)} placeholder="9876543210" />
        <FieldError />
      </TextField>

      <TextField name="bookingFor" className="col-span-2">
        <Label>Booking For</Label>
        <CustomRadioGroup
          value={data.bookingFor}
          options={[
            { label: "Self", value: "self" },
            { label: "Family", value: "other (family)" },
            { label: "Corporate", value: "corporate" },
            { label: "Guest", value: "guest" },
          ]}
          onValueChange={(v) => onChange("bookingFor", v)}
        />
      </TextField>

      <TextField name="serviceType" className="col-span-2">
        <Label>Service Type</Label>
        <CustomRadioGroup
          value={data.serviceType}
          options={[
            { label: "Local",      value: "local" },
            { label: "Outstation", value: "outstation" },
            { label: "Airport",    value: "airport" },
          ]}
          onValueChange={(v) => onChange("serviceType", v)}
        />
      </TextField>

      <TextField name="tripType" className="col-span-2">
        <Label>Trip Type</Label>
        <CustomRadioGroup
          value={data.tripType}
          options={[
            { label: "One Way",    value: "oneway" },
            { label: "Round Trip", value: "roundtrip" },
          ]}
          onValueChange={(v) => {
            onChange("tripType", v);
            if (v === "oneway") { onChange("returnDate", ""); onChange("returnTime", ""); }
          }}
        />
      </TextField>

      <LocationSearchInput
        label="Pickup Location"
        placeholder="Search pickup address"
        value={data.pickup}
        required
        className="col-span-2"
        onSelect={(r) => {
          onChange("pickup",    r.name);
          onChange("pickupZone", r.zone);
          onChange("pickupLat",  String(r.lat));
          onChange("pickupLng",  String(r.lng));
        }}
        onClear={() => {
          onChange("pickup",    "");
          onChange("pickupZone", "");
          onChange("pickupLat",  "");
          onChange("pickupLng",  "");
        }}
      />

      <LocationSearchInput
        label="Drop Location"
        placeholder="Search drop address"
        value={data.drop}
        required
        className="col-span-2"
        onSelect={(r) => {
          onChange("drop",    r.name);
          onChange("dropZone", r.zone);
          onChange("dropLat",  String(r.lat));
          onChange("dropLng",  String(r.lng));
        }}
        onClear={() => {
          onChange("drop",    "");
          onChange("dropZone", "");
          onChange("dropLat",  "");
          onChange("dropLng",  "");
        }}
      />
    </div>
  );
}

/* ── Step 2: Vehicle & Schedule ──────────────────────────────────────────── */
interface StepTwoProps extends StepProps {
  vehicles: Vehicle[];
  onVehicleChange: (value: string) => void;
}

function StepTwo({ data, vehicles, onChange, onVehicleChange }: StepTwoProps) {
  const acBool           = data.acPreference === "ac";
  const filteredVehicles = vehicles.filter((v) => v.ac === acBool);
  const currentValid     = filteredVehicles.some((v) => v.type === data.vehicleType);
  const isRoundTrip      = data.tripType === "roundtrip";

  return (
    <div className="grid grid-cols-2 gap-4">
      <TextField isRequired name="tripDate">
        <Label>Outbound Date</Label>
        <Input type="date" variant="secondary" value={data.tripDate}
          onChange={(e) => onChange("tripDate", e.target.value)} />
        <FieldError />
      </TextField>

      <TextField isRequired name="tripTime">
        <Label>Outbound Time</Label>
        <Input type="time" variant="secondary" value={data.tripTime}
          onChange={(e) => onChange("tripTime", e.target.value)} />
        <FieldError />
      </TextField>

      {isRoundTrip && (
        <>
          <TextField isRequired name="returnDate">
            <Label>Return Date</Label>
            <Input type="date" variant="secondary" value={data.returnDate}
              onChange={(e) => onChange("returnDate", e.target.value)} />
            <FieldError />
          </TextField>

          <TextField isRequired name="returnTime">
            <Label>Return Time</Label>
            <Input type="time" variant="secondary" value={data.returnTime}
              onChange={(e) => onChange("returnTime", e.target.value)} />
            <FieldError />
          </TextField>
        </>
      )}

      <TextField name="acPreference" className="col-span-2">
        <Label>AC Preference</Label>
        <CustomRadioGroup
          value={data.acPreference}
          options={[{ label: "AC", value: "ac" }, { label: "Non-AC", value: "non-ac" }]}
          onValueChange={(v) => { onChange("acPreference", v); onChange("vehicleType", ""); onChange("totalFare", ""); }}
        />
      </TextField>

      <div className="col-span-2 flex flex-col gap-1.5">
        <Select
          isRequired
          name="vehicleType"
          variant="secondary"
          placeholder="Select vehicle type"
          selectedKey={currentValid ? data.vehicleType : null}
          onSelectionChange={(key) => onVehicleChange(String(key))}
          isDisabled={vehicles.length === 0}
        >
          <Label>Vehicle Type</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {filteredVehicles.map((v) => (
                <ListBox.Item key={v.type} id={v.type} textValue={v.type}>
                  <span className="flex items-center justify-between w-full gap-4">
                    <span>{v.type}</span>
                    <span className="text-xs text-text-tertiary">{formatFare(getVehicleFare(v))}</span>
                  </span>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
          <FieldError />
        </Select>
      </div>

      <TextField isRequired name="seatsRequired" className="col-span-2">
        <Label>Seats Required</Label>
        <CustomRadioGroup
          value={data.seatsRequired}
          options={["1","2","3","4","5","6","7"].map((n) => ({ label: n, value: n }))}
          onValueChange={(v) => onChange("seatsRequired", v)}
        />
        <FieldError />
      </TextField>
    </div>
  );
}

/* ── Step 3: Fare & Confirm ──────────────────────────────────────────────── */
interface StepThreeProps extends StepProps {
  vehicles:    Vehicle[];
  distanceKm:  number | null;
}

function StepThree({ data, vehicles, distanceKm, onChange }: StepThreeProps) {
  const vehicle   = vehicles.find((v) => v.type === data.vehicleType);
  const baseFare  = vehicle ? getVehicleFare(vehicle) : null;
  const fareHint  = baseFare ? formatFare(baseFare) : null;
  const suggestedFare =
    distanceKm && baseFare?.unit === "per km"
      ? Math.ceil(distanceKm * baseFare.amount)
      : null;

  return (
    <div className="space-y-5">
      {/* Booking summary */}
      <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2 text-sm">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Booking Summary</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <span className="text-text-secondary">Passenger</span>
          <span className="font-medium text-text-primary">{data.customerName} · {data.customerPhone}</span>
          <span className="text-text-secondary">Route</span>
          <span className="font-medium text-text-primary truncate">{data.pickup} → {data.drop}</span>
          <span className="text-text-secondary">Service</span>
          <span className="font-medium text-text-primary capitalize">{data.serviceType} · {data.tripType === "roundtrip" ? "Round Trip" : "One Way"}</span>
          <span className="text-text-secondary">Outbound</span>
          <span className="font-medium text-text-primary">{data.tripDate} at {data.tripTime}</span>
          {data.tripType === "roundtrip" && (
            <>
              <span className="text-text-secondary">Return</span>
              <span className="font-medium text-text-primary">{data.returnDate} at {data.returnTime}</span>
            </>
          )}
          <span className="text-text-secondary">Vehicle</span>
          <span className="font-medium text-text-primary">{data.vehicleType || "—"}</span>
          <span className="text-text-secondary">Seats</span>
          <span className="font-medium text-text-primary">{data.seatsRequired}</span>
          {distanceKm !== null && (
            <>
              <span className="text-text-secondary">Distance</span>
              <span className="font-medium text-text-primary">{distanceKm} km (road)</span>
            </>
          )}
        </div>
      </div>

      {/* Fare entry */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Fare (Cash)</p>
          <div className="flex items-center gap-2">
            {suggestedFare && (
              <button
                type="button"
                onClick={() => onChange("totalFare", String(suggestedFare))}
                className="text-[11px] text-primary underline underline-offset-2 hover:no-underline"
              >
                Use ₹{suggestedFare} ({distanceKm} km × {baseFare?.amount}/km)
              </button>
            )}
            {fareHint && !suggestedFare && (
              <span className="text-[11px] text-text-tertiary">Base rate: {fareHint}</span>
            )}
          </div>
        </div>
        <TextField isRequired name="totalFare">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-text-secondary pointer-events-none">₹</span>
            <Input
              variant="secondary"
              type="number"
              min="0"
              step="0.01"
              value={data.totalFare}
              onChange={(e) => onChange("totalFare", e.target.value)}
              placeholder="Enter total fare"
              className="pl-8"
            />
          </div>
          <FieldError />
        </TextField>
        <p className="text-[11px] text-text-tertiary">
          Payment will be collected in cash by the driver. A cash-pending record will be created automatically.
        </p>
      </div>

      {/* Notes */}
      <TextField name="notes">
        <Label>Special Instructions</Label>
        <TextArea variant="secondary" value={data.notes} rows={2}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="e.g. Passenger is elderly, carry wheelchair…" />
      </TextField>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AssignDriverForBookingForm() {
  return (
    <ComboBox className="w-[256px]">
      <Label>Assign Driver</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search drivers..." variant="secondary" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox></ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

export default AddBookings;
