import { Card, Separator } from "@heroui/react";
import { User } from "lucide-react";

export function PersonalDetails({ user }: { user: any }) {
  return (
    <Card className="p-6 h-full row-span-2 " variant="secondary">
      <div className="flex items-center gap-2 text-accent">
        <User size={18} />
        <h3 className="font-semibold text-accent">Personal Details</h3>
      </div>
      <Separator variant="secondary" />

      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        <DetailItem label="Full Name" value={user.name} />
        <DetailItem label="Rider ID" value="R-501" />
        <DetailItem label="Phone" value="98765 43210" />
        <DetailItem label="Email" value="priya.sharma@gmail.com" />
        <DetailItem label="Gender" value="Female" />
        <DetailItem label="Date of Birth" value="14 Mar 1992" />
        <DetailItem label="City" value="Mumbai" />
        <DetailItem label="Member Since" value="Jan 2025" />

        <div className="col-span-2 flex flex-col gap-1">
          <span className="text-xs text-default-400 font-medium">Address</span>
          <span className="text-sm font-bold text-default-800">
            B-204, Hiranandani Gardens, Powai, Mumbai 400076
          </span>
        </div>
      </div>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
