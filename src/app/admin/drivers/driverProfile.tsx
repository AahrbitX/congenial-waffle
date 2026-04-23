import { Button, buttonVariants, Modal } from "@heroui/react";
import Link from "next/link";
import React from "react";

function DriverProfile({ id }: { id: string }) {
  return (
    <Modal>
      <Modal.Trigger>
        <span className="text-accent font-bold hover:underline cursor-pointer underline-offset-2">
          {id}
        </span>
      </Modal.Trigger>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Driver Profile</Modal.Heading>
            </Modal.Header>
            <Modal.Body> </Modal.Body>
            <Modal.Footer>
              <Link
                href={`/admin/drivers/${id}`}
                className={buttonVariants({ variant: "primary" })}
              >
                View Full Profile
              </Link>
              <Button variant="secondary">Edit Driver</Button>
              <Button variant="danger">Suspend Driver</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default DriverProfile;
