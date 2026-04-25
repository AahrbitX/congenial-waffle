"use client";

import { Booking } from "@/types/bookings";
import { bookingColumns } from "./columns";
import { DataTable } from "@/components/dataTable";
import {
  Button,
  Chip,
  DateField,
  DateRangePicker,
  Label,
  ListBox,
  RangeCalendar,
  SearchField,
  Select,
  Surface,
  Switch,
} from "@heroui/react";
import { Plus, RefreshCcw, Upload } from "lucide-react";

export default function BookingsPage() {
  const data: Booking[] = [
    {
      id: "123",
      rider: "John Doe",
      bookingDate: "2024-06-01",
      driver: "Jane Smith",
      fare: "$25.00",
      status: "pending",
    },
    {
      id: "123",
      rider: "John Doe",
      bookingDate: "2024-06-01",
      driver: "Jane Smith",
      fare: "$25.00",
      status: "pending",
    },
    {
      id: "123",
      rider: "John Doe",
      bookingDate: "2024-06-01",
      driver: null,
      fare: "$25.00",
      status: "confirmed",
    },
    {
      id: "123",
      rider: "John Doe",
      bookingDate: "2024-06-01",
      driver: "Jane Smith",
      fare: "$25.00",
      status: "completed",
    },
    {
      id: "123",
      rider: "John Doe",
      bookingDate: "2024-06-01",
      driver: "Jane Smith",
      fare: "$25.00",
      status: "cancelled",
    },
  ];

  return (
    <Surface className="p-4 ">
      <div className="flex items-center justify-between my-0">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Bookings</h1>
          <Button isIconOnly variant="ghost" name="refresh">
            <RefreshCcw />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary">
            <Upload /> Export
          </Button>
          <Button variant="primary" className={""}>
            <Plus /> Add Booking
          </Button>
        </div>
      </div>
      <div className="w-full my-4 flex items-center justify-between">
        <div className="flex items-center gap-2 justify-start">
          <SearchField name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search with Booking ID" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <Select
            className="w-36"
            placeholder="Select Status"
            variant="secondary"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="pending" textValue="pending">
                  <Chip variant="primary" color="warning">
                    Pending
                  </Chip>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="confirmed" textValue="confirmed">
                  <Chip variant="primary" color="accent">
                    Confirmed
                  </Chip>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="completed" textValue="completed">
                  <Chip variant="primary" color="success">
                    Completed
                  </Chip>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="cancelled" textValue="cancelled">
                  <Chip variant="primary" color="danger">
                    Cancelled
                  </Chip>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <DateRangePicker>
            <DateField.Group variant="secondary">
              <DateField.InputContainer>
                <DateField.Input slot="start">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateRangePicker.RangeSeparator />
                <DateField.Input slot="end">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.InputContainer>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover>
              <RangeCalendar aria-label="Choose trip dates">
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
          <Switch size="lg">
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Content>
              <Label className="text-muted">Show Unassigned</Label>
            </Switch.Content>
          </Switch>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary">Reset Filter</Button>
        </div>
      </div>
      <div>
        <DataTable<Booking> data={data} columns={bookingColumns} />
      </div>
    </Surface>
  );
}
