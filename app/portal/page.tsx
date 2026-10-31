import { LogOut } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { PortalDocumentsSection } from "@/components/portal/portal-documents-section";
import { getOrCreateStudentProfile, pickDisplayName, PortalAccessDeniedError } from "@/lib/student-session";
import { listReferenceSchools } from "@/lib/schools";
import { getAuthenticatedUser } from "@/lib/auth";
import { signOutAction } from "@/app/portal/actions";

function AccessDenied() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-32 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Chưa có quyền truy cập</h1>
        <p className="mt-4 text-muted-foreground">
          Tài khoản Google của bạn chưa có yêu cầu báo giá được duyệt, nên chưa thể sử dụng Cổng hồ sơ. Vui lòng gửi
          yêu cầu báo giá trên trang chủ và chờ được duyệt, hoặc liên hệ{" "}
          <a href="mailto:hotro@duhoc24.vn" className="text-primary underline underline-offset-4">
            hotro@duhoc24.vn
          </a>{" "}
          để được hỗ trợ.
        </p>
        <form action={signOutAction} className="mt-8 flex justify-center">
          <Button type="submit" variant="outline">
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}

export default async function PortalPage() {
  let profile;
  try {
    profile = await getOrCreateStudentProfile();
  } catch (error) {
    if (error instanceof PortalAccessDeniedError) {
      return <AccessDenied />;
    }
    throw error;
  }

  const [schools, user] = await Promise.all([listReferenceSchools(), getAuthenticatedUser()]);
  const displayName = pickDisplayName(profile) ?? user?.name ?? "bạn";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">Xin chào,</p>
            <h1 className="text-2xl font-medium tracking-tight">{displayName}</h1>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </form>
        </div>

        <PortalDocumentsSection initialProfile={profile} schools={schools} />
      </main>
    </>
  );
}
