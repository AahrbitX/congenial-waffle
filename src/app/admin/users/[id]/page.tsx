"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumbs, Button, Chip, Input, Skeleton, Surface, Tabs, toast } from "@heroui/react";
import { Ban, Pencil, Trash2, RefreshCcw } from "lucide-react";

import { request } from "@/lib/api-client";
import { ProfileHeader, ProfileHeaderSkeleton } from "@/components/user/ProfileHeader";

import OverviewTab    from "./tabs/overview";
import RideHistoryTab from "./tabs/ride-history";
import PaymentsTab    from "./tabs/payments";
import ReviewsTab     from "./tabs/reviews";
import { PersonalDetailsSkeleton } from "./tabs/overview/personalDetails";

// ── Full-page skeleton ────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Profile card */}
      <ProfileHeaderSkeleton />

      {/* Tabs list */}
      <div className="flex gap-6 border-b border-border pb-2 mt-2 mb-4">
        {["w-16", "w-24", "w-20", "w-16"].map((w, i) => (
          <Skeleton key={i} className={`h-4 ${w} rounded`} />
        ))}
      </div>

      {/* Tab content — mirrors the Overview tab grid */}
      <div className="grid grid-cols-2 gap-4">
        <PersonalDetailsSkeleton />
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function UserDetailsPage() {
  const params      = useParams<{ id: string }>();
  const userId      = params.id;
  const queryClient = useQueryClient();
  const router      = useRouter();

  const [editing,       setEditing]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editName,      setEditName]      = useState("");
  const [editPhone,     setEditPhone]     = useState("");

  const { data: responseData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["user", userId],
    queryFn:  () => request<{ success: boolean; data: any }>(`/api/users/${userId}`),
  });

  const userData = responseData?.data;

  useEffect(() => {
    if (userData) {
      setEditName(userData.name        ?? "");
      setEditPhone(userData.phoneNumber ?? "");
    }
  }, [userData?.id]);

  const updateMutation = useMutation({
    mutationFn: () => request(`/api/users/${userId}`, {
      method: "PATCH",
      body:   JSON.stringify({ name: editName, phone: editPhone }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
      setEditing(false);
    },
    onError: () => toast("Failed to update user", { variant: "danger" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => request(`/api/users/${userId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
      router.push("/admin/users");
    },
    onError: () => toast("Failed to delete user", { variant: "danger" }),
  });

  const suspendMutation = useMutation({
    mutationFn: (banned: boolean) => request(`/api/users/${userId}/suspend`, {
      method: "PATCH",
      body:   JSON.stringify({ banned }),
    }),
    onSuccess: (_data, banned) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(banned ? "User suspended" : "User unsuspended");
    },
    onError: () => toast("Action failed", { variant: "danger" }),
  });

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!isLoading && !userData) {
    return (
      <Surface className="h-full flex flex-col items-center justify-center gap-3 text-center p-8" variant="secondary">
        <p className="text-sm font-semibold">User not found</p>
        <p className="text-xs text-muted">This user may have been deleted or the ID is invalid.</p>
        <Button size="sm" variant="outline" onPress={() => router.push("/admin/users")}>
          Back to Users
        </Button>
      </Surface>
    );
  }

  const isBanned = userData?.banned === true;

  return (
    <Surface className="h-full overflow-y-auto p-4 scrollbar-thin" variant="secondary">
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <>
          {/* ── Top bar ── */}
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
              <Button isIconOnly variant="ghost" size="sm" onPress={() => refetch()} isDisabled={isFetching}>
                <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
              </Button>
              <Button size="sm" variant="outline" onPress={() => setEditing((v) => !v)}>
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

          {/* ── Inline edit form ── */}
          {editing && (
            <div className="mb-4 p-4 rounded-xl border border-border bg-surface flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-52" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-44" />
              </div>
              <Button
                onPress={() => updateMutation.mutate()}
                isDisabled={updateMutation.isPending || !editName.trim()}
              >
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          )}

          {/* ── Profile card ── */}
          <ProfileHeader
            name={userData.name}
            isActive={!isBanned}
            details={[{ label: "Phone", value: userData.phoneNumber ?? "—" }]}
            stats={[
              {
                label: "Member Since",
                value: new Date(userData.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year:  "numeric",
                }),
              },
            ]}
          />

          {/* ── Tabs ── */}
          <Tabs className="w-full">
            <Tabs.ListContainer className="max-w-xl">
              <Tabs.List aria-label="User details tabs">
                <Tabs.Tab id="overview">Overview<Tabs.Indicator /></Tabs.Tab>
                <Tabs.Tab id="ride-history"><Tabs.Separator />Ride History<Tabs.Indicator /></Tabs.Tab>
                <Tabs.Tab id="payments"><Tabs.Separator />Payments<Tabs.Indicator /></Tabs.Tab>
                <Tabs.Tab id="reviews"><Tabs.Separator />Reviews<Tabs.Indicator /></Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
            <OverviewTab    user={userData} />
            <RideHistoryTab userId={userId} />
            <PaymentsTab    userId={userId} />
            <ReviewsTab     userId={userId} />
          </Tabs>
        </>
      )}
    </Surface>
  );
}

export default UserDetailsPage;
