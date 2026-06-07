"use client";

import React from "react";
import { Button, Label, Modal, TextArea, toast } from "@heroui/react";
import { request } from "@/lib/api-client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban } from "lucide-react";

function SuspendModal({
  userId,
  userName,
  isUserBanned,
  bannedReason,
}: {
  userName: string;
  userId: string;
  bannedReason?: string;
  isUserBanned: boolean;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const suspendMutation = useMutation({
    mutationFn: (banned: boolean) =>
      request(`/api/drivers/${userId}/suspend`, {
        method: "PATCH",
        body: JSON.stringify({ banned, reason }),
      }),
    onSuccess: (_data, banned) => {
      setReason("");
      setIsOpen(false);

      queryClient.invalidateQueries({ queryKey: ["driver", userId] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });

      toast.success(banned ? "Driver suspended" : "Driver unsuspended");
    },
    onError: () => toast.danger("Action failed"),
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button size="sm" variant={isUserBanned ? "primary" : "danger-soft"}>
        <Ban size={14} />
        {isUserBanned ? "Unsuspend" : "Suspend"}
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Are You Sure?</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isUserBanned ? (
                <div>
                  <p className="text-sm text-muted mt-2">
                    This Driver is currently suspended with reason:{" "}
                    <span className="font-semibold text-black">
                      {bannedReason}
                    </span>
                  </p>
                  <p>You can choose to unsuspend them.</p>
                </div>
              ) : (
                <div>
                  <p>
                    Suspending the Driver:{" "}
                    <span className="font-semibold">{userName}</span> will
                    prevent them from getting new rides. They will be able to
                    complete any ongoing rides but won&apos;t be able to accept
                    new ones. They also won&apos;t be able to log in to the
                    driver app.
                  </p>

                  <div className="space-y-1 flex flex-col mt-4">
                    <Label htmlFor="banReason">Reason for suspension</Label>
                    <TextArea
                      id="banReason"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      variant="secondary"
                      placeholder="Provide meaningful reason for the suspension"
                    />
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              {isUserBanned ? (
                <Button
                  className="w-full"
                  variant="primary"
                  onPress={() => suspendMutation.mutate(false)}
                >
                  Unsuspend Driver
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="danger"
                  onPress={() => suspendMutation.mutate(true)}
                >
                  Suspend Driver
                </Button>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default SuspendModal;
