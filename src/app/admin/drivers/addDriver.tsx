"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button, Modal } from "@heroui/react";

function AddDriver() {
  return (
    <Modal>
      <Button variant="primary" className={"bg-orange-500"}>
        <Plus /> Add Drivers
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Add Driver Form</Modal.Heading>
            </Modal.Header>
            <Modal.Body> </Modal.Body>
            <Modal.Footer>
              <Button>Confirm</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default AddDriver;
