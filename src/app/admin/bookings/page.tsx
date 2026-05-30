"use client";

import { Booking } from "@/types/bookings";
import { bookingColumns } from "./columns";
import { DataTable } from "@/components/dataTable/dynamic";
import {
  Button,
  DateField,
  DateRangePicker,
  ListBox,
  RangeCalendar,
  SearchField,
  Select,
  Surface,
} from "@heroui/react";
import { RefreshCcw, Upload } from "lucide-react";
import AddBookings from "./addBookings";
import { useQuery } from "@tanstack/react-query";
import { PaginatedResponse } from "@/types/responseTypes";
import { request } from "@/lib/api-client";
import { useState } from "react";

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: bookingData, isLoading } = useQuery<PaginatedResponse<Booking>>(
    {
      queryKey: ["bookings"],
      queryFn: async () => {
        return request(`/api/bookings?page=${page}&limit=${limit}`, {
          method: "GET",
        });
      },
    },
  );

  return (
    <Surface className="p-4 min-h-full">
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
          <AddBookings />
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
                  Pending
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="confirmed" textValue="confirmed">
                  Confirmed
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="completed" textValue="completed">
                  Completed
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="cancelled" textValue="cancelled">
                  Cancelled
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
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary">Reset Filter</Button>
        </div>
      </div>
      <div>
        <DataTable<Booking>
          isLoading={isLoading}
          onPageChange={setPage}
          pagination={bookingData?.pagination}
          data={bookingData?.data || []}
          columns={bookingColumns}
        />
      </div>
    </Surface>
  );
}
