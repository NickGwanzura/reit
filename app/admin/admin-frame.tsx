"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "M";
}

function labelRole(role: string) {
  return role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SidebarIcon({ name }: { name: "leads" | "followups" | "team" | "settings" | "website" }) {
  const paths = {
    leads: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    followups: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.3-3.1 2.1-5 5.5-5s5.2 1.9 5.5 5" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 15c2.2.4 3.3 1.9 3.5 4" /></>,
    settings: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" fill="#14243d" /><circle cx="15" cy="12" r="2" fill="#14243d" /><circle cx="11" cy="18" r="2" fill="#14243d" /></>,
    website: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function AdminFrame({ name, role, children }: { name: string; role: string; children: ReactNode }) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";

  return (
    <div className="crm-shell crm-admin-layout">
      <aside className="crm-sidebar">
        <a className="crm-sidebar-brand" href="/admin" aria-label="Mutirikwi REIT staff workspace">
          <span className="crm-brand-mark" aria-hidden="true">M</span>
          <span className="crm-sidebar-brand-name">MUTIRIKWI <b>REIT</b><small>STAFF WORKSPACE</small></span>
        </a>
        <p className="crm-sidebar-caption">WORKSPACE</p>
        <nav className="crm-sidebar-nav" aria-label="Staff workspace">
          <a className={pathname === "/admin" ? "active" : ""} href="/admin"><span className="crm-sidebar-icon"><SidebarIcon name="leads" /></span><span>Leads</span></a>
          <a href="/admin#follow-ups"><span className="crm-sidebar-icon"><SidebarIcon name="followups" /></span><span>Follow-ups</span></a>
          {isSuperAdmin && <a className={pathname.startsWith("/admin/team") ? "active" : ""} href="/admin/team"><span className="crm-sidebar-icon"><SidebarIcon name="team" /></span><span>Team & invites</span><span className="crm-sidebar-new">ADMIN</span></a>}
        </nav>
        <p className="crm-sidebar-caption crm-sidebar-account-label">ACCOUNT</p>
        <nav className="crm-sidebar-nav" aria-label="Account settings">
          <a className={pathname.startsWith("/admin/security") ? "active" : ""} href="/admin/security"><span className="crm-sidebar-icon"><SidebarIcon name="settings" /></span><span>Security</span></a>
          <a href="/" target="_blank" rel="noreferrer"><span className="crm-sidebar-icon"><SidebarIcon name="website" /></span><span>View public website</span></a>
        </nav>
        <div className="crm-sidebar-spacer" />
        <div className="crm-sidebar-user"><span className="crm-sidebar-avatar">{initials(name)}</span><span className="crm-sidebar-user-info"><strong>{name}</strong><small>{labelRole(role)}</small></span><button type="button" aria-label="Sign out" title="Sign out" onClick={() => signOut({ redirectTo: "/admin/login" })}>↗</button></div>
      </aside>
      <div className="crm-admin-content">{children}</div>
    </div>
  );
}
