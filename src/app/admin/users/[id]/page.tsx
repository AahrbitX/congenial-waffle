"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Breadcrumbs, Button, Chip, Input, Surface, Tabs, toast } from "@heroui/react";
import { Ban, Pencil, Trash2 } from "lucide-react";

import { User } from "@/types/user";
import { request } from "@/lib/api-client";
import { ProfileHeader } from "@/components/user/ProfileHeader";
import { useRouter } from "next/navigation";

import ReviewsTab from "./tabs/reviews";
import TicketsTab from "./tabs/tickets";
import OverviewTab from "./tabs/overview";
import PaymentsTab from "./tabs/payments";
import RideHistoryTab from "./tabs/ride-history";

function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const queryClient = useQueryClient();
  const router = useRouter();

  // Edit state
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const { data: responseData, isLoading } = useQuery<User>({
    queryKey: [userId],
    queryFn: () => request(`/api/users/${userId}`),
  });

  const userData = (responseData as any)?.data;

  useEffect(() => {
    if (userData) {
      setEditName(userData.name ?? "");
      setEditPhone(userData.phoneNumber ?? "");
    }
  }, [userData?.id]);

  const updateMutation = useMutation({
    mutationFn: () =>
      request(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName, phone: editPhone }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
      setEditing(false);
    },
    onError: () => toast.danger("Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      request(`/api/users/${userId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
      router.push("/admin/users");
    },
    onError: () => toast.danger("Failed to delete user"),
  });

  const suspendMutation = useMutation({
    mutationFn: (banned: boolean) =>
      request(`/api/users/${userId}/suspend`, {
        method: "PATCH",
        body: JSON.stringify({ banned }),
      }),
    onSuccess: (_data, banned) => {
      queryClient.invalidateQueries({ queryKey: [userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(banned ? "User suspended" : "User unsuspended");
    },
    onError: () => toast.danger("Action failed"),
  });

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading…</div>;
  if (!userData) return <div className="p-4">No data found</div>;

  const isBanned = userData.banned === true;

  return (
    <Surface className="h-full overflow-y-auto p-4 scrollbar-thin" variant="secondary">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-2">
          <Breadcrumbs>
            <Breadcrumbs.Item href="/admin/users">Users</Breadcrumbs.Item>
            <Breadcrumbs.Item>{userData.name}</Breadcrumbs.Item>
          </Breadcrumbs>
          {isBanned && (
            <Chip size="sm" color="danger" variant="soft">Suspended</Chip>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onPress={() => setEditing((v) => !v)}
          >
            <Pencil size={14} />
            {editing ? "Cancel" : "Edit"}
          </Button>
          <Button
            size="sm"
            variant={isBanned ? "secondary" : "outline"}
            isDisabled={suspendMutation.isPending}
            onPress={() => suspendMutation.mutate(!isBanned)}
          >
            <Ban size={14} />
            {isBanned ? "Unsuspend" : "Suspend"}
          </Button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-danger font-medium">Delete this user?</span>
              <Button
                size="sm"
                variant="danger"
                isDisabled={deleteMutation.isPending}
                onPress={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, Delete"}
              </Button>
              <Button size="sm" variant="ghost" onPress={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onPress={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Inline edit form */}
      {editing && (
        <div className="mb-4 p-4 rounded-xl border border-border bg-surface flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-52"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <Input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-44"
            />
          </div>
          <Button
            onPress={() => updateMutation.mutate()}
            isDisabled={updateMutation.isPending || !editName.trim()}
            className="bg-primary text-white font-semibold rounded-xl"
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      )}

      {/* Profile Header */}
      <div className="shrink-0">
        <ProfileHeader
          name={userData.name}
          details={[{ label: "Phone", value: userData.phoneNumber }]}
          stats={[
            {
              label: "Member Since",
              value: new Date(userData.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              }),
            },
          ]}
        />
      </div>

      {/* Tabs */}
      <div className="flex-1 min-h-0">
        <Tabs className="w-full">
          <Tabs.ListContainer className="max-w-xl">
            <Tabs.List aria-label="Options">
              <Tabs.Tab id="overview">Overview<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="ride-history"><Tabs.Separator />Ride History<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="payments"><Tabs.Separator />Payments<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="reviews"><Tabs.Separator />Reviews<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="tickets"><Tabs.Separator />Tickets<Tabs.Indicator /></Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <OverviewTab user={userData} />
          <RideHistoryTab />
          <PaymentsTab />
          <ReviewsTab />
          <TicketsTab />
        </Tabs>
      </div>
    </Surface>
  );
}

export default UserDetailsPage;
