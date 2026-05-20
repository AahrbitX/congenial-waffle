"use client";

import { useState, type FormEvent } from "react";
import { Avatar, Input, InputOTP, Label } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { IconCamera, IconUser } from "@/constants/icons";
import { AnimatePresence, motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";

const slideVariants = {
  enterFromRight: { opacity: 0, x: 40 },
  enterFromLeft:  { opacity: 0, x: -40 },
  center:         { opacity: 1, x: 0 },
  exitToLeft:     { opacity: 0, x: -40 },
};

interface OtpLoginFlowProps {
  onSuccess: () => void;
}

export function OtpLoginFlow({ onSuccess }: OtpLoginFlowProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [obLoading, setObLoading] = useState(false);
  const [obError, setObError] = useState("");

  const handleSendOtp = async () => {
    if (!phone.trim()) { setOtpError("Please enter your phone number."); return; }
    setOtpError("");
    setOtpLoading(true);

    const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: phone.trim() });

    if (error) {
      setOtpError(error.message || "Failed to send OTP.");
      setOtpLoading(false);
      return;
    }

    setOtpSent(true);
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpError("Please enter the 6-digit OTP."); return; }
    setOtpError("");
    setOtpLoading(true);

    const { data, error } = await authClient.phoneNumber.verify({
      phoneNumber: phone.trim(),
      code: otp,
    });

    if (error) {
      setOtpError(error.message || "Verification failed.");
      setOtpLoading(false);
      return;
    }

    // New user: name was set to the phone number as a placeholder
    const isNewUser = data?.user?.name === phone.trim();

    if (isNewUser) {
      setShowOnboarding(true);
      setOtpLoading(false);
    } else {
      // Session already created and atom updated by better-auth automatically
      onSuccess();
    }
  };

  const handleOnboardingSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setObError("Full name is required."); return; }
    setObError("");
    setObLoading(true);

    const { error } = await authClient.updateUser({
      name: name.trim(),
      ...(dob ? { dob } : {}),
    } as any);

    if (error) {
      setObError(error.message || "Failed to save profile.");
      setObLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>

        {!showOnboarding ? (
          <motion.div
            key="otp"
            variants={slideVariants}
            initial="enterFromLeft"
            animate="center"
            exit="exitToLeft"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col gap-4"
          >
            <div>
              <Label htmlFor="otp-phone">Phone Number</Label>
              <Input
                id="otp-phone"
                variant="secondary"
                className="mt-2 w-full"
                placeholder="+91 XXXXX XXXXX"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpSent || otpLoading}
              />
            </div>

            <div>
              <Label htmlFor="otp-code" className="mb-2">
                One-Time Password (OTP)
              </Label>
              <InputOTP
                maxLength={6}
                isDisabled={!otpSent || otpLoading}
                className="mt-2 w-full"
                variant="secondary"
                value={otp}
                onChange={setOtp}
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

            {otpError && <p className="text-center text-sm text-danger">{otpError}</p>}

            {!otpSent ? (
              <Button className="mt-4 w-full" size="lg" onPress={handleSendOtp} isLoading={otpLoading} disabled={otpLoading}>
                Send OTP
              </Button>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  className="w-full"
                  size="lg"
                  onPress={handleVerifyOtp}
                  isLoading={otpLoading}
                  disabled={otpLoading}
                >
                  Verify OTP
                </Button>
                <button
                  type="button"
                  className="text-center text-xs text-muted hover:underline"
                  onClick={() => { setOtpSent(false); setOtp(""); setOtpError(""); }}
                >
                  Change phone number
                </button>
              </div>
            )}
          </motion.div>

        ) : (

          <motion.div
            key="onboarding"
            variants={slideVariants}
            initial="enterFromRight"
            animate="center"
            exit="exitToLeft"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-1 pt-2">
              <div className="relative">
                <Avatar className="size-16">
                  <Avatar.Fallback>
                    {name
                      ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                      : <IconUser size={22} />}
                  </Avatar.Fallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-accent text-white shadow"
                >
                  <IconCamera size={12} />
                </button>
              </div>
              <span className="text-xs text-muted">Profile photo (optional)</span>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleOnboardingSubmit}>
              <div>
                <Label>Phone Number</Label>
                <p className="mt-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-muted">
                  {phone}
                </p>
              </div>

              <div>
                <Label htmlFor="ob-name">Full Name</Label>
                <Input
                  id="ob-name"
                  variant="secondary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full"
                  placeholder="e.g. Abin J"
                  disabled={obLoading}
                />
              </div>

              <div>
                <Label htmlFor="ob-dob">
                  Date of Birth <span className="text-muted">(optional)</span>
                </Label>
                <Input
                  id="ob-dob"
                  variant="secondary"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-2 w-full"
                  type="date"
                  disabled={obLoading}
                />
              </div>

              {obError && <p className="text-center text-sm text-danger">{obError}</p>}

              <Button className="w-full" size="lg" type="submit" isLoading={obLoading} disabled={obLoading}>
                Get Started →
              </Button>

              <button
                type="button"
                className="text-center text-xs text-muted hover:underline"
                onClick={() => { setShowOnboarding(false); setOtp(""); setOtpSent(false); }}
              >
                ← Back
              </button>
            </form>
          </motion.div>

        )}
      </AnimatePresence>
    </div>
  );
}
