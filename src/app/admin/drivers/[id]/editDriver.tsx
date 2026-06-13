"use client";

import React from "react";
import { Edit } from "lucide-react";

import { DriverForm } from "../driverForm";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { Button, Modal, toast } from "@heroui/react";

function EditDriver({ driverData }: { driverData: Record<string, any> }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const mutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      const payload = {
        ...formData,
        ac: formData.ac === "on" || formData.ac === "true",
        isAvailable:
          formData.isAvailable === "on" || formData.isAvailable === "true",
      };

      return request(`/api/drivers/update/${driverData.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [driverData.id] });
      setIsOpen(false);
    },
    onError: () => {
      toast.danger("Failed to update Driver");
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button size="sm" onPress={() => setIsOpen(true)}>
        <Edit size={18} />
        Edit Driver
      </Button>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Edit Existing Driver</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="py-2">
              <DriverForm formData={driverData} handleSubmit={handleSubmit} />
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
              <Button type="submit" form="driver-form">
                Update Driver
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default EditDriver;
