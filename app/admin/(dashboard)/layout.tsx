import { redirect } from "next/navigation";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/sidebar";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

// proxy.ts already redirects non-admin requests away from /admin before
// they reach this layout, so this is a defensive fallback.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin || !admin.role) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar admin={{ email: admin.email, role: admin.role }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav admin={{ email: admin.email, role: admin.role }} />
        <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
