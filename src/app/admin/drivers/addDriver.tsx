"use client";

import React from "react";
import { request } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { Plus, Phone, User, Calendar, Hash } from "lucide-react";
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
  Select,
  Checkbox,
  Switch,
  ListBox,
  Description,
  Toast,
  toast,
} from "@heroui/react";
import { queryClient } from "@/lib/query-client";

function AddDriver() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Toast.Provider />
      <Modal>
        <Button onPress={() => setIsOpen(true)}>
          <Plus size={18} />
          Add Drivers
        </Button>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Register New Driver</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="py-4">
                <AddDriverForm setIsOpen={setIsOpen} />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="ghost"
                  onPress={(e) => {
                    e.continuePropagation();
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" form="driver-registration-form">
                  Confirm Registration
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

const AddDriverForm = ({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const mutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      const payload = {
        ...formData,
        ac: formData.ac === "on" || formData.ac === "true",
        isAvailable:
          formData.isAvailable === "on" || formData.isAvailable === "true",
      };

      // Using your existing request helper
      return request("/api/drivers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      setIsOpen(false);
      toast.success("New Driver Created");
    },
    onError: (error: Error) => {
      toast.danger("Failed to create Driver");
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    mutation.mutate(data);
  };

  return (
    <form
      id="driver-registration-form"
      className="flex flex-col gap-6 p-2"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Name */}
        <TextField isRequired name="name">
          <Label id="name">Full Name</Label>
          <div className="relative flex items-center">
            <User size={16} className="absolute left-3 text-default-400" />
            <Input
              id="name"
              placeholder="Driver Name"
              className="pl-9 w-full"
              variant="secondary"
            />
          </div>
          <FieldError />
        </TextField>

        {/* Phone */}
        <TextField
          isRequired
          name="phone"
          type="tel"
          validate={(value) => {
            if (!/^\d{10}$/.test(value)) {
              return "Phone number must be exactly 10 digits without spaces or symbols.";
            }
            return null;
          }}
        >
          <Label>Phone Number</Label>
          <div className="relative flex items-center">
            <Phone size={16} className="absolute left-3 text-default-400" />
            <Input
              id="phone"
              placeholder="+91 XXXXX XXXXX"
              className="pl-9 w-full"
              variant="secondary"
            />
          </div>
          <FieldError />
        </TextField>

        {/* DOB */}
        <TextField isRequired name="dob" type="date">
          <Label>Date of Birth</Label>
          <div className="relative flex items-center">
            <Calendar size={16} className="absolute left-3 text-default-400" />
            <Input id="dob" className="pl-9 w-full" variant="secondary" />
          </div>
          <FieldError />
        </TextField>

        {/* Vehicle Number */}
        <TextField isRequired name="vehicleNumber">
          <Label>Vehicle Number</Label>
          <div className="relative flex items-center">
            <Hash size={16} className="absolute left-3 text-default-400" />
            <Input
              id="vehicleNumber"
              placeholder="TN01AB1234"
              className="pl-9 w-full"
              variant="secondary"
            />
          </div>
          <FieldError />
        </TextField>

        {/* Vehicle Type - Select Component */}
        <div className="flex flex-col gap-1.5">
          <Select
            id="vehicleType"
            isRequired
            className="w-full"
            name="vehicleType"
            placeholder="Select one"
            variant="secondary"
          >
            <Label>Vehicle Type</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="sedan" textValue="sedan">
                  Sedan
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="suv" textValue="suv">
                  SUV
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="minivan" textValue="minivan">
                  MiniVan
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
            <FieldError />
          </Select>
        </div>

        {/* Initial Availability - Switch Component */}
        <div className="flex flex-col gap-3">
          <Label>Availability</Label>
          <Switch id="isAvailable" defaultSelected name="isAvailable">
            <Switch.Control>
              <Switch.Thumb>
                <Switch.Icon />
              </Switch.Thumb>
            </Switch.Control>
            <Switch.Content>
              <Label>Available</Label>
              <Description>Available to take rides</Description>
            </Switch.Content>
          </Switch>
        </div>
      </div>

      {/* AC Preference - Checkbox */}

      <Checkbox name="ac" id="ac">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Air Conditioned</Label>
          <Description>Is the vehicle is air conditioned?</Description>
        </Checkbox.Content>
      </Checkbox>
    </form>
  );
};

export default AddDriver;
