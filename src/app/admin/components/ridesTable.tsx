import { ridesColumns } from "./columns";
import { useDashboardRides } from "@/hooks/dashboard";
import { DataTable } from "@/components/dataTable/dynamic";
import { Card } from "@heroui/react";

export const RidesTable = () => {
  const { data, isLoading } = useDashboardRides();

  return (
    <Card>
      <Card.Header>
        <Card.Title>Today&apos;s Rides</Card.Title>
      </Card.Header>
      <DataTable<any>
        isLoading={isLoading}
        columns={ridesColumns}
        data={data?.rides ?? []}
      />
    </Card>
  );
};
