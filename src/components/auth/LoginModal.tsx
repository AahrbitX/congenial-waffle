"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "@heroui/react";
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

  useEffect(() => {
    if (!isMobile || !isOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, isOpen]);

  const sheetContent = (
    <div className={`w-full flex flex-col ${isMobile ? "max-h-[88svh]" : "max-w-sm max-h-[90vh]"}`}>
      {/* Drag handle — mobile only */}
      {isMobile && (
        <div className="flex justify-center pt-4 pb-2 shrink-0">
          <div className="h-1 w-12 rounded-full bg-gray-300" />
        </div>
      )}

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
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 z-[9999] flex flex-col rounded-t-3xl bg-[var(--color-surface)] shadow-2xl"
            >
              {sheetContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body,
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
