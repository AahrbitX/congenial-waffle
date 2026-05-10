"use client";
import { Input, Button, InputOTP, Label } from "@heroui/react";
import { useState } from "react";

export default function PhoneLoginForm() {
  const [otpSent, setOtpSent] = useState(false);

  const handleOTP = () => {
    setOtpSent(true);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Label htmlFor="phone" className="">
          Phone Number
        </Label>
        <Input
          id="phone"
          variant="secondary"
          className="mt-2 w-full"
          placeholder="+91 XXXXX XXXXX"
          type="tel"
        />
      </div>
      <div>
        <Label htmlFor="otp" className="mb-2">
          One-Time Password (OTP)
        </Label>
        <InputOTP
          maxLength={4}
          isDisabled={!otpSent}
          className="mt-2 w-full"
          variant="secondary"
        >
          <InputOTP.Group className="flex items-center justify-center w-full">
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
      <Button className="w-full mt-4" size="lg" onClick={handleOTP}>
        {otpSent ? "Verify OTP" : "Send OTP"}
      </Button>
    </form>
  );
}
