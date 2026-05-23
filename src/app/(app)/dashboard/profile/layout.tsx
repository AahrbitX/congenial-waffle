"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { IconChevronLeft } from "@/constants/icons";

const SUB_TITLES: Record<string, string> = {
  [ROUTES.dashboard.profile.privacy]: "Privacy & Safety",
  [ROUTES.dashboard.profile.notifications]: "Notifications",
  [ROUTES.dashboard.profile.help]: "Help & Support",
  [ROUTES.dashboard.profile.refer]: "Refer & Earn",
  [ROUTES.dashboard.profile.preferences]: "Preferences",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSubScreen = pathname !== ROUTES.dashboard.profile.root;
  const subTitle = SUB_TITLES[pathname];

  return (
    <div className="space-y-4">
      {isSubScreen && subTitle && (
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.dashboard.profile.root}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:text-primary border border-[var(--color-border)] px-3 py-1.5 rounded-xl hover:bg-[var(--color-surface-muted)] transition-all"
          >
            <IconChevronLeft size={14} /> Back
          </Link>
          <p className="text-[16px] font-black text-primary">{subTitle}</p>
        </div>
      )}
      {children}
    </div>
  );
}
