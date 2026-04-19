"use client";

import React from "react";
import { Card, Tabs } from "@heroui/react";
import PhoneLoginForm from "./phoneLoginForm";
import PasswordLoginForm from "./passwordLoginForm";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-[420px] h-auto  p-2 border-none flex flex-col items-center justify-start">
        <Card.Header className="flex flex-col items-center justify-center gap-2 pb-2 pt-6">
          <div className="">Logo</div>
          <div className="flex flex-col items-center mt-2">
            <h1 className="text-2xl font-bold tracking-tight">Mohan Cabs</h1>
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
              <PhoneLoginForm />
            </Tabs.Panel>
            <Tabs.Panel className="pt-4" id="password">
              <PasswordLoginForm />
            </Tabs.Panel>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
