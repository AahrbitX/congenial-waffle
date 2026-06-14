"use client";

import { useEffect, useState } from "react";
import { Drawer, Modal } from "@heroui/react";
import { OtpLoginFlow } from "./OtpLoginFlow";
import { IconX } from "@/constants/icons";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sheetContent = (
    <div className="w-full flex flex-col max-h-[90vh]">

      <div className={isMobile ? "px-5 pb-6 overflow-y-auto" : ""}>
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <p className="text-lg font-bold">Sign in to continue</p>
          {!isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="pb-2">
          <OtpLoginFlow onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) onClose(); }}
      >
        <Drawer.Backdrop className="bg-black/40 backdrop-blur-sm">
          <Drawer.Content placement="bottom">
            <Drawer.Dialog className="p-0 pt-2">
              <Drawer.Handle />
              {sheetContent}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <Modal.Backdrop className="bg-black/40 backdrop-blur-sm">
        <Modal.Container>
          <Modal.Dialog className="max-w-sm">
            {sheetContent}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
