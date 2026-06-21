"use client";

import { differenceInYears } from "date-fns";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Skeleton,
  Surface,
  Tabs,
} from "@heroui/react";

import { request } from "@/lib/api-client";
import {
  ProfileHeader,
  ProfileHeaderSkeleton,
} from "@/components/user/ProfileHeader";

import RideHistoryTab from "./tabs/ride-history";
import PaymentsTab from "./tabs/payments";
import ReviewsTab from "./tabs/reviews";
import { PersonalDetailsSkeleton } from "./personalDetails";
import SuspendModal from "./suspendModal";

function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const router = useRouter();

  const { data: responseData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      request<{ success: boolean; data: any }>(`/api/users/${userId}`),
  });

  const userData = responseData?.data;

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!isLoading && !userData) {
    return (
      <Surface
        className="h-full flex flex-col items-center justify-center gap-3 text-center p-8"
        variant="secondary"
      >
        <p className="text-sm font-semibold">User not found</p>
        <p className="text-xs text-muted">
          This user may have been deleted or the ID is invalid.
        </p>
        <Button
          size="sm"
          variant="outline"
          onPress={() => router.push("/admin/users")}
        >
          Back to Users
        </Button>
      </Surface>
    );
  }

  const isBanned = userData?.banned === true;

  return (
    <Surface
      className="h-full overflow-y-auto p-4 scrollbar-thin"
      variant="secondary"
    >
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
                <Chip size="sm" color="danger" variant="soft">
                  Suspended
                </Chip>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SuspendModal
                userId={userId}
                isUserBanned={isBanned}
                bannedReason={userData?.bannedReason}
                userName={userData?.name ?? "this user"}
              />
              <Button
                size="sm"
                variant="primary"
              >
                Edit
              </Button>
            </div>
          </div>

          {/* ── Profile card ── */}
          <ProfileHeader
            name={userData.name}
            phoneNumber={userData.phoneNumber}
            isActive={!isBanned}
            details={[
              { label: "Phone", value: userData.phoneNumber || "—" },
              {
                label: "Date of Birth",
                value: userData.dob
                  ? `${userData.dob} (${differenceInYears(new Date(), new Date(userData.dob))})`
                  : "—",
              },
              {
                label: "Gender",
                value: userData.gender || "—",
              },
            ]}
            stats={[
              {
                label: "Member Since",
                value: new Date(userData.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    month: "short",
                    year: "numeric",
                  },
                ),
              },
            ]}
          />

          {/* ── Tabs ── */}
          <Card>
            <Tabs className="w-full">
              <Tabs.ListContainer className="max-w-xl">
                {/* Tabs List */}
                <Tabs.List aria-label="User details tabs">
                  <Tabs.Tab id="ride-history">
                    Ride History
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="payments">
                    <Tabs.Separator />
                    Payments
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="reviews">
                    <Tabs.Separator />
                    Reviews
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              {/* Tab components */}
              <RideHistoryTab userId={userId} panelId="ride-history" />
              <PaymentsTab userId={userId} panelId="payments" />
              <ReviewsTab userId={userId} panelId="reviews" />
            </Tabs>
          </Card>
        </>
      )}
    </Surface>
  );
}

export default UserDetailsPage;

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
