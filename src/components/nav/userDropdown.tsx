"use client";

import React from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Avatar, Dropdown, Label, Spinner } from "@heroui/react";
import { Car, Headphones, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

function UserDropdown() {
  const { data, isPending } = authClient.useSession();

  const router = useRouter();
  const queryClient = useQueryClient();
  const isAdmin = (data?.user as any)?.role === "admin";
  const userName = data?.user?.name || "User";

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.clear();
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  if (isPending) {
    return (
      <Avatar>
        <Spinner />
      </Avatar>
    );
  }

  return (
    <div className="flex items-center justify-center bg-transparent">
      {!data ? (
        <Link
          href={"/login"}
          className="text-sm font-semibold bg-primary text-white rounded-full px-5 py-2 inline-flex items-center gap-1.5 shadow-sm"
        >
          Login
        </Link>
      ) : (
        <div className="flex items-center justify-center gap-2 pr-1 pl-1.5 py-1">
          <Link
            href={isAdmin ? "/admin" : "/dashboard/overview"}
            className="text-sm font-semibold bg-primary text-white px-5 py-2  rounded-full inline-flex items-center gap-1.5 shadow-sm"
          >
            Dashboard
          </Link>
          <Dropdown>
            <Dropdown.Trigger>
              <Avatar>
                <Avatar.Fallback>{userName.charAt(0)}</Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu>
                <Dropdown.Item
                  onPress={() => router.push("/dashboard/overview")}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <Label>Profile</Label>
                    <User className="size-3.5" />
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onPress={() => router.push("/dashboard/rides")}>
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
