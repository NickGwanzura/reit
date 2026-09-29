import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/authz";
import { PasswordForm } from "@/app/admin/password-form";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login");

  return (
    <main className="crm-auth-page">
      <section className="crm-auth-card">
        <a className="crm-brand" href="/admin">MUTIRIKWI <span>REIT</span></a>
        <p className="crm-kicker">ACCOUNT SECURITY · {staff.name}</p>
        <h1>Change password</h1>
        <p className="crm-auth-intro">{staff.mustChangePassword ? "Set a private password to activate this account. You will be signed out after the change." : "Changing your password signs out every active CRM session for this account."}</p>
        <PasswordForm />
        <p className="crm-small-print"><a href="/admin">← Return to lead workspace</a></p>
      </section>
    </main>
  );
}
