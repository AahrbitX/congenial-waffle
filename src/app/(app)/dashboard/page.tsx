import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function DashboardRoot() {
  redirect(ROUTES.dashboard.overview);
}
