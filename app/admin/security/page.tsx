import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/authz";
import { PasswordForm } from "@/app/admin/password-form";
import { AdminFrame } from "@/app/admin/admin-frame";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login");

  return (
    <AdminFrame name={staff.name} role={staff.role}>
      <main className="crm-main crm-security-main">
        <section className="crm-auth-card">
          <p className="crm-kicker">ACCOUNT SECURITY</p>
          <h1>Change password</h1>
          <p className="crm-auth-intro">{staff.mustChangePassword ? "Set a private password to activate this account. You will be signed out after the change." : "Changing your password signs out every active CRM session for this account."}</p>
          <PasswordForm />
        </section>
      </main>
    </AdminFrame>
  );
}
