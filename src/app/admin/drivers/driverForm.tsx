import React from "react";

import { Phone, User, Calendar, Hash } from "lucide-react";
import {
  FieldError,
  Input,
  Label,
  TextField,
  Select,
  Checkbox,
  Switch,
  ListBox,
  Description,
} from "@heroui/react";

export const DriverForm = ({
  handleSubmit,
}: {
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}) => {
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
        <div className="flex flex-col gap-1.5">
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
      <Checkbox name="ac" id="ac" variant="secondary">
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
