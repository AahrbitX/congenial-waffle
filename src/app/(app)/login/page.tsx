"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import { Card, Surface, Tabs } from "@heroui/react";
import PhoneLoginForm from "./phoneLoginForm";
import PasswordLoginForm from "./passwordLoginForm";
import { ASSETS } from "@/constants/assets";

export default function LoginPage() {
  return (
    <Surface
      variant="secondary"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-10"
    >
      {/* Hero-section blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[700px] w-[700px] rounded-full bg-primary-soft/60 blur-3xl" />
        <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-primary-soft/40 blur-3xl" />
      </div>

      {/* Car behind the form */}
      <div className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <img
          src={ASSETS.car}
          alt=""
          className="w-full drop-shadow-2xl opacity-20"
        />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[420px]">
        <Card className="w-full h-auto p-2 border-none flex flex-col items-center justify-start">
          <Card.Header className="flex flex-col items-center justify-center gap-2 pb-2 pt-6">
            <div className="flex items-center gap-2">
              <Image src={ASSETS.logos.minimal.src} alt={ASSETS.logos.minimal.alt} width={36} height={36} />
              <Image src={ASSETS.logos.darkFullName.src} alt={ASSETS.logos.darkFullName.alt} width={120} height={32} className="object-contain" />
            </div>
            <div className="flex flex-col items-center mt-1">
              <p className="text-small text-default-500">
                Select your preferred login method
              </p>
            </div>
          </Card.Header>

          <div className="p-4 w-full grow">
            <Tabs aria-label="Login Options" className="w-full max-w-md">
              <Tabs.ListContainer>
                <Tabs.List aria-label="Login Methods">
                  <Tabs.Tab id="otp">
                    OTP
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="password">
                    Password
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel className="pt-4 h-full" id="otp">
                <Suspense>
                  <PhoneLoginForm />
                </Suspense>
              </Tabs.Panel>
              <Tabs.Panel className="pt-4" id="password">
                <Suspense>
                  <PasswordLoginForm />
                </Suspense>
              </Tabs.Panel>
            </Tabs>
          </div>
        </Card>
      </div>
    </Surface>
  );
}
