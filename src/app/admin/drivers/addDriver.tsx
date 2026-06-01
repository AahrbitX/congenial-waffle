"use client";

import React from "react";
import { Plus } from "lucide-react";

import { DriverForm } from "./driverForm";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { Button, Modal, toast } from "@heroui/react";

function AddDriver() {
  const [isOpen, setIsOpen] = React.useState(false);

  const mutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      const payload = {
        ...formData,
        ac: formData.ac === "on" || formData.ac === "true",
        isAvailable:
          formData.isAvailable === "on" || formData.isAvailable === "true",
      };

      return request("/api/drivers/onboard", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      setIsOpen(false);
      toast.success("New Driver Created");
    },
    onError: () => {
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
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button onPress={() => setIsOpen(true)} size="sm">
        <Plus size={18} />
        Add Driver
      </Button>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Register New Driver</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="py-2">
              <DriverForm handleSubmit={handleSubmit} />
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
                Confirm Registration
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default AddDriver;
