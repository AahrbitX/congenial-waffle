import React from "react";
import { Button, Drawer } from "@heroui/react";
import { UserPlus } from "lucide-react";

function AssignDriver({ id }: { id: string }) {
  return (
    <Drawer>
      <Button size="sm" variant="tertiary">
        <UserPlus size={16} />
        Assign Driver
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Assign Driver</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>Assign Driver for Booking ID:{id}</Drawer.Body>
            <Drawer.Footer />
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

export default AssignDriver;
