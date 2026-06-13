"use client";

import { useEffect, useState } from "react";
import { Drawer, Input, InputOTP, Label } from "@heroui/react";
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

export function PasswordModal({ isOpen, onClose, hasPassword, phoneNumber }: PasswordModalProps) {
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
    const { error: err } = await authClient.phoneNumber.sendOtp({ phoneNumber });
    if (err) {
      setError(err.message || "Failed to send OTP.");
      setLoading(false);
      return;
    }
    setStep("verify");
    setLoading(false);
  }

  async function handleSetPassword() {
    if (otp.length !== 6) { setError("Please enter the 6-digit OTP."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

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

  const content = step === "success" ? (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-success-light)] flex items-center justify-center">
        <IconCheckCircle size={32} className="text-[var(--color-success)]" />
      </div>
      <p className="text-[18px] font-black text-primary">
        {hasPassword ? "Password updated!" : "Password created!"}
      </p>
      <p className="text-sm text-muted">You can now sign in with your phone number and password.</p>
    </div>
  ) : (
    <>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
          <IconLock size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-primary">{title}</p>
          <p className="text-xs text-muted">
            {step === "send" ? "We'll send an OTP to verify it's you" : "Enter the OTP and your new password"}
          </p>
        </div>
      </div>

      {step === "send" && (
        <div>
          <Label>Phone Number</Label>
          <p className="mt-1 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-muted bg-[var(--color-surface-muted)]">
            {phoneNumber}
          </p>
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2">OTP sent to {phoneNumber}</Label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              className="w-full"
              variant="secondary"
            >
              <InputOTP.Group className="flex w-full items-center justify-center">
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
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              variant="secondary"
              className="mt-1 w-full"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              variant="secondary"
              className="mt-1 w-full"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger text-center">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button
          onPress={handleClose}
          className="flex-1 rounded-xl font-semibold border border-[var(--color-border-strong)] text-[var(--color-text-secondary)]"
        >
          Cancel
        </Button>
        {step === "send" ? (
          <Button
            onPress={handleSendOtp}
            isLoading={loading}
            className="flex-1 rounded-xl font-bold bg-[var(--color-primary)] text-white"
          >
            Send OTP
          </Button>
        ) : (
          <Button
            onPress={handleSetPassword}
            isLoading={loading}
            className="flex-1 rounded-xl font-bold bg-[var(--color-primary)] text-white"
          >
            {hasPassword ? "Reset" : "Create"}
          </Button>
        )}
      </div>

      {step === "verify" && (
        <button
          type="button"
          className="w-full text-center text-xs text-muted hover:underline"
          onClick={() => { setStep("send"); setOtp(""); setError(""); }}
        >
          ← Resend OTP
        </button>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) handleClose(); }}
      >
        <Drawer.Backdrop className="bg-black/40 backdrop-blur-sm">
          <Drawer.Content placement="bottom">
            <Drawer.Dialog className="p-0 pt-2">
              <Drawer.Handle />
              <div className="px-5 pb-6 space-y-4">{content}</div>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-sm"
      >
        <div className="p-6 space-y-4">{content}</div>
      </div>
    </div>
  );
}
