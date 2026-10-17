import { LogOut } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { PortalDocumentsSection } from "@/components/portal/portal-documents-section";
import { getOrCreateStudentProfile, pickDisplayName } from "@/lib/student-session";
import { listReferenceSchools } from "@/lib/schools";

export default async function PortalPage() {
  const [profile, schools] = await Promise.all([getOrCreateStudentProfile(), listReferenceSchools()]);
  const displayName = pickDisplayName(profile) ?? "bạn";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">Xin chào,</p>
            <h1 className="text-2xl font-medium tracking-tight">{displayName}</h1>
          </div>
          <Button variant="outline">
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>

        <PortalDocumentsSection initialProfile={profile} schools={schools} />
      </main>
    </>
  );
}
