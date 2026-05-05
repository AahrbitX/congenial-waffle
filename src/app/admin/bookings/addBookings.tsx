"use client";

import React, { useState } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import {
  cn,
  Button,
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
  TextArea,
  toast,
} from "@heroui/react";
import CustomRadioGroup from "@/components/form/customRadioGroup";
import Summary from "@/components/data/summary";
import { useMutation } from "@tanstack/react-query";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

type BookingFormData = {
  customerName: string;
  customerPhone: string;
  bookingFor: string;

  pickup: string;
  pickupZone: string;

  drop: string;
  dropZone: string;

  tripDate: string;
  tripTime: string;
  vehicleType: string;
  seatsRequired: string;
  acPreference: string;

  assignDriver: string;
  notes: string;
};

const initialFormData: BookingFormData = {
  customerName: "",
  customerPhone: "",
  bookingFor: "self",

  pickup: "",
  pickupZone: "",

  drop: "",
  dropZone: "",

  tripDate: "",
  tripTime: "",

  vehicleType: "sedan",
  seatsRequired: "4",
  acPreference: "ac",

  assignDriver: "nil",
  notes: "",
};

function AddBookings({ className }: { className?: string }) {
  const [step, setStep] = useState<number>(1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);

  const updateField = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const mutation = useMutation({
    mutationFn: async (formData: BookingFormData) => {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        source: "admin",
        pickupName: formData.pickup, // Location Address
        pickupZone: formData.pickupZone, // Location Pincode
        dropName: formData.drop, // Location Address
        dropZone: formData.dropZone, // Location Pincode
        journeyDate: formData.tripDate,
        journeyTime: formData.tripTime,
        members: Number(formData.seatsRequired),
        vehicleType: formData.vehicleType.toLowerCase(),
        ac: formData.acPreference === "ac",

        totalFare: "0.00",
      };

      // Using your existing request helper
      return request("/api/bookings/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setIsOpen(false);
      toast.success("New Booking Created");
    },
    onError: () => {
      toast.danger("Failed to create new Booking");
    },
  });

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="primary"
        className={cn("", className)}
        onPress={() => setIsOpen(true)}
      >
        <Plus size={16} />
        Add Booking
      </Button>

      <ModalBackdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />

            <Modal.Header className="gap-1">
              <Modal.Heading>Add New Booking</Modal.Heading>

              <Description>
                Step {step} of 3 —{" "}
                {step === 1
                  ? "Passenger Info"
                  : step === 2
                    ? "Trip Details"
                    : "Preferences"}
              </Description>
            </Modal.Header>

            <Separator className="my-4" />

            <CreateBookingForm
              step={step}
              data={formData}
              onChange={updateField}
            />

            <Separator className="my-4" />

            <Modal.Footer>
              {step === 1 && (
                <Button fullWidth onPress={() => setStep(2)}>
                  Next : Trip Details
                </Button>
              )}

              {step === 2 && (
                <>
                  <Button
                    variant="secondary"
                    fullWidth
                    onPress={() => setStep(1)}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </Button>

                  <Button fullWidth onPress={() => setStep(3)}>
                    Next : Preferences
                  </Button>
                </>
              )}

              {step === 3 && (
                <>
                  <Button
                    variant="secondary"
                    fullWidth
                    onPress={() => setStep(2)}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </Button>

                  <Button fullWidth onPress={handleSubmit}>
                    Confirm and Create Booking
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

interface CreateBookingFormProps {
  step: number;
  data: BookingFormData;
  onChange: (field: keyof BookingFormData, value: string) => void;
}

function CreateBookingForm(props: CreateBookingFormProps) {
  const { step, data, onChange } = props;

  return (
    <div className="space-y-4 min-h-[260px]">
      {step === 1 && (
        <>
          <CreateBookingStepOne data={data} onChange={onChange} />
        </>
      )}

      {step === 2 && (
        <>
          <CreateBookingStepTwo data={data} onChange={onChange} />
        </>
      )}

      {step === 3 && (
        <>
          <CreateBookingStepThree data={data} onChange={onChange} />
        </>
      )}
    </div>
  );
}

interface BookingStepProps {
  data: BookingFormData;
  onChange: (field: keyof BookingFormData, value: string) => void;
}

function CreateBookingStepOne(props: BookingStepProps) {
  const { data, onChange } = props;

  return (
    <div className="grid grid-cols-2 gap-3">
      <TextField isRequired name="customerName">
        <Label id="customerName">Passenger Name</Label>
        <Input
          variant="secondary"
          value={data.customerName}
          onChange={(e) => onChange("customerName", e.target.value)}
          placeholder="Passenger Name"
        />
        <FieldError />
      </TextField>

      <TextField isRequired name="customerPhone">
        <Label id="phone">Mobile Number</Label>
        <Input
          variant="secondary"
          value={data.customerPhone}
          onChange={(e) => onChange("customerPhone", e.target.value)}
          placeholder="9876543210"
        />
        <FieldError />
      </TextField>

      <TextField isRequired name="bookingFor" className={"col-span-2"}>
        <Label>Booking For</Label>
        <CustomRadioGroup
          value={data.bookingFor}
          options={[
            { label: "self", value: "self" },
            { label: "other (family)", value: "other (family)" },
            { label: "corporate", value: "corporate" },
            { label: "guest", value: "guest" },
          ]}
          onValueChange={(value) => onChange("bookingFor", value)}
        />
        <FieldError />
      </TextField>

      <TextField isRequired name="pickup">
        <Label id="pickup">Pickup Location</Label>
        <Input
          variant="secondary"
          value={data.pickup}
          onChange={(e) => onChange("pickup", e.target.value)}
          placeholder="Enter pickup address"
        />
        <FieldError />
      </TextField>
      <TextField isRequired name="pickupZone">
        <Label id="pickup">Pickup Zone</Label>
        <Input
          variant="secondary"
          value={data.pickupZone}
          onChange={(e) => onChange("pickupZone", e.target.value)}
          placeholder="Pickup Location Pincode"
        />
        <FieldError />
      </TextField>

      <TextField isRequired name="drop">
        <Label id="drop">Drop Location</Label>
        <Input
          variant="secondary"
          value={data.drop}
          onChange={(e) => onChange("drop", e.target.value)}
          placeholder="Enter drop address"
        />
        <FieldError />
      </TextField>
      <TextField isRequired name="dropZone">
        <Label id="drop">Drop Zone</Label>
        <Input
          variant="secondary"
          value={data.dropZone}
          onChange={(e) => onChange("dropZone", e.target.value)}
          placeholder="Drop Location Pincode"
        />
        <FieldError />
      </TextField>
    </div>
  );
}

function CreateBookingStepTwo(props: BookingStepProps) {
  const { data, onChange } = props;

  return (
    <div className="grid grid-cols-2 gap-4">
      <TextField isRequired name="tripDate">
        <Label id="tripDate">Ride Date</Label>
        <Input
          type="date"
          variant="secondary"
          value={data.tripDate}
          onChange={(e) => onChange("tripDate", e.target.value)}
        />
        <FieldError />
      </TextField>

      <TextField isRequired name="tripTime">
        <Label id="tripTime">Ride Time</Label>
        <Input
          type="time"
          variant="secondary"
          value={data.tripTime}
          onChange={(e) => onChange("tripTime", e.target.value)}
        />
        <FieldError />
      </TextField>

      <TextField isRequired name="vehicleType" className={"col-span-2"}>
        <Label id="vehicleType">Vehicle Type</Label>
        <CustomRadioGroup
          value={data.vehicleType}
          options={[
            { label: "Sedan", value: "sedan" },
            { label: "SUV", value: "suv" },
            { label: "Minivan", value: "minivan" },
          ]}
          onValueChange={(value) => onChange("vehicleType", value)}
        />
        <FieldError />
      </TextField>

      <TextField isRequired name="acPreference">
        <Label id="acPreference">AC Preference</Label>
        <CustomRadioGroup
          value={data.acPreference}
          options={[
            { label: "AC", value: "ac" },
            { label: "Non AC", value: "non-ac" },
          ]}
          onValueChange={(value) => onChange("acPreference", value)}
        />
        <FieldError />
      </TextField>

      <TextField isRequired name="seatsRequired" className={"col-span-2"}>
        <Label id="seatsRequired">Seats Required</Label>
        <CustomRadioGroup
          value={data.seatsRequired}
          options={[
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
            { label: "5", value: "5" },
            { label: "6", value: "6" },
            { label: "7", value: "7" },
          ]}
          onValueChange={(value) => onChange("seatsRequired", value)}
        />
        <FieldError />
      </TextField>
    </div>
  );
}

function CreateBookingStepThree(props: BookingStepProps) {
  const { data, onChange } = props;

  return (
    <div className="space-y-4">
      <TextField name="assignDriver">
        <AssignDriverForBookingForm />
      </TextField>

      <TextField name="notes">
        <Label id="notes">Special Instructions / Notes</Label>
        <TextArea
          variant="secondary"
          value={data.notes}
          rows={3}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Passenger is elderly..."
        />
        <FieldError />
      </TextField>

      <Summary data={data} size="compact" />
    </div>
  );
}

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
