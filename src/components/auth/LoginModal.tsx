"use client";

import { Modal, ModalBackdrop } from "@heroui/react";
import { OtpLoginFlow } from "./OtpLoginFlow";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <ModalBackdrop>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header className="gap-1">
              <Modal.Heading>Sign in to continue</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="py-4">
              <OtpLoginFlow onSuccess={onSuccess} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </ModalBackdrop>
    </Modal>
  );
}
