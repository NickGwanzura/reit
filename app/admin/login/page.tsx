import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLoginForm } from "@/app/admin/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/admin");
  return <AdminLoginForm />;
}
