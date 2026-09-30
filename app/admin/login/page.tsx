import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/admin/login-form";
import { getStaffUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // A signed JWT can outlive a staff-account change (for example, a password
  // reset increments sessionVersion). Only redirect sessions that still map
  // to an active, authorised CRM user; otherwise the login page itself must
  // remain reachable so the user can sign in again.
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (staff) redirect("/admin");
  return <AdminLoginForm />;
}
