"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Description, Input, InputOTP, Label, Modal } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { setPassword } from "@/api/user.api";
import { useQueryClient } from "@tanstack/react-query";
import { HAS_PASSWORD_KEY } from "@/hooks/useUser";
import { IconCheckCircle, IconLock } from "@/constants/icons";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPassword: boolean;
  phoneNumber: string;
}

export function PasswordModal({
  isOpen,
  onClose,
  hasPassword,
  phoneNumber,
}: PasswordModalProps) {
  const qc = useQueryClient();

  const [step, setStep] = useState<"send" | "verify" | "success">("send");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = hasPassword ? "Reset Password" : "Create Password";

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile]);

  function handleClose() {
    setStep("send");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setLoading(false);
    onClose();
  }

  async function handleSendOtp() {
    setLoading(true);
    setError("");
    const { error: err } = await authClient.phoneNumber.sendOtp({
      phoneNumber,
    });
    if (err) {
      setError(err.message || "Failed to send OTP.");
      setLoading(false);
      return;
    }
    setStep("verify");
    setLoading(false);
  }

  async function handleSetPassword() {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await setPassword(otp, newPassword);
      qc.invalidateQueries({ queryKey: HAS_PASSWORD_KEY });
      setStep("success");
      setTimeout(() => handleClose(), 1800);
    } catch (err: any) {
      setError(err?.message || "Failed to set password. Please try again.");
    }
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />

            {step === "success" ? (
              <>
                <Modal.Body>
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                      <IconCheckCircle size={32} className="text-success" />
                    </div>

                    <p className="text-lg font-bold">
                      {hasPassword ? "Password updated!" : "Password created!"}
                    </p>

                    <p className="text-sm text-muted">
                      You can now sign in with your phone number and password.
                    </p>
                  </div>
                </Modal.Body>
              </>
            ) : (
              <>
                <Modal.Header>
                  <Modal.Icon className="bg-primary/10 text-primary">
                    <IconLock size={20} />
                  </Modal.Icon>

                  <div>
                    <Modal.Heading>{title}</Modal.Heading>

                    <Description>
                      {step === "send"
                        ? "We'll send an OTP to verify it's you"
                        : "Enter the OTP and your new password"}
                    </Description>
                  </div>
                </Modal.Header>

                <Modal.Body className="space-y-4">
                  {step === "send" && (
                    <div>
                      <Label>Phone Number</Label>

                      <p className="mt-1 rounded-xl border border-border px-3 py-2 text-sm text-muted bg-surface-muted">
                        {phoneNumber}
                      </p>
                    </div>
                  )}

                  {step === "verify" && (
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2">
                          OTP sent to {phoneNumber}
                        </Label>

                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={setOtp}
                          variant="secondary"
                          className="w-fit mt-2"
                        >
                          <InputOTP.Group>
                            <InputOTP.Slot index={0} />
                            <InputOTP.Slot index={1} />
                            <InputOTP.Slot index={2} />
                            <InputOTP.Separator />
                            <InputOTP.Slot index={3} />
                            <InputOTP.Slot index={4} />
                            <InputOTP.Slot index={5} />
                          </InputOTP.Group>
                        </InputOTP>
                      </div>

                      <div className="flex items-start flex-col gap-2">
                        <Label>New Password</Label>

                        <Input
                          type="password"
                          variant="secondary"
                          fullWidth
                          placeholder="Minimum 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="flex items-start flex-col gap-2">
                        <Label>Confirm Password</Label>

                        <Input
                          type="password"
                          fullWidth
                          variant="secondary"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <button
                        type="button"
                        className="w-full text-center text-xs text-muted hover:underline"
                        onClick={() => {
                          setStep("send");
                          setOtp("");
                          setError("");
                        }}
                      >
                        ← Resend OTP
                      </button>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-danger text-center">{error}</p>
                  )}
                </Modal.Body>

                <Modal.Footer>
                  <Button slot="close" variant="outline" className="flex-1">
                    Cancel
                  </Button>

                  {step === "send" ? (
                    <Button
                      onPress={handleSendOtp}
                      isLoading={loading}
                      className="flex-1"
                    >
                      Send OTP
                    </Button>
                  ) : (
                    <Button
                      onPress={handleSetPassword}
                      isLoading={loading}
                      className="flex-1"
                    >
                      {hasPassword ? "Reset" : "Create"}
                    </Button>
                  )}
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
