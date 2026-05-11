"use client";

import React from "react";
import Link from "next/link";
import { buttonVariants } from "@heroui/styles";
import { authClient } from "@/lib/auth-client";
import { Avatar, Dropdown, Label, Spinner } from "@heroui/react";
import { Car, Headphones, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

function UserDropdown() {
  const { data, isPending, error } = authClient.useSession();

  const router = useRouter();
  const isAdmin = (data?.user as any)?.role === "admin";
  const userName = data?.user?.name || "User";

  const handleLogout = async () => {
    await authClient.signOut();
  };

  if (isPending) {
    return (
      <Avatar>
        <Spinner />
      </Avatar>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {!data && !error ? (
        <Link
          href={"/login"}
          className={buttonVariants({ variant: "primary" })}
        >
          Login
        </Link>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className={buttonVariants({ variant: "primary" })}
            >
              Dashboard
            </Link>
          )}
          <Dropdown>
            <Dropdown.Trigger>
              <Avatar>
                <Avatar.Fallback>{userName.charAt(0)}</Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu>
                <Dropdown.Item onPress={() => router.push("/dashboard/overview")}>
                  <div className="flex w-full items-center justify-between gap-2">
                    <Label>Profile</Label>
                    <User className="size-3.5" />
                  </div>
                </Dropdown.Item>
                <Dropdown.Item
                  onPress={() => router.push("/dashboard/rides")}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <Label>Ride History</Label>
                    <Car className="size-3.5" />
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onPress={() => router.push("/support")}>
                  <div className="flex w-full items-center justify-between gap-2">
                    <Label>Support</Label>
                    <Headphones className="size-3.5" />
                  </div>
                </Dropdown.Item>
                <Dropdown.Item
                  id="logout"
                  textValue="Logout"
                  variant="danger"
                  onClick={handleLogout}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <Label>Log Out</Label>
                    <LogOut className="size-3.5 text-danger" />
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
