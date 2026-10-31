import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const initialError =
    params.error === "unauthorized" ? "Tài khoản này không có quyền truy cập trang quản trị." : null;

  return <AdminLoginForm initialError={initialError} />;
}
