import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountRoleSelect } from "@/components/admin/account-role-select";
import { CreateAccountForm } from "@/components/admin/create-account-form";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { listInternalAccounts } from "@/lib/admin/accounts";
import { formatDateTime } from "@/lib/utils";

const roleLabel = { admin: "Quản trị viên", nhan_vien: "Nhân viên" } as const;

export default async function AdminAccountsPage() {
  const admin = await getAuthenticatedAdmin();
  if (admin?.role !== "admin") {
    redirect("/admin");
  }

  const accounts = await listInternalAccounts();

  return (
    <>
      <AdminPageHeader
        title="Tài khoản nội bộ"
        description="Quản lý tài khoản đăng nhập trang quản trị và vai trò của từng người."
      />

      <div className="space-y-6">
        <CreateAccountForm />

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Tạo lúc</TableHead>
                <TableHead>Đăng nhập gần nhất</TableHead>
                <TableHead className="text-right">Đổi vai trò</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Chưa có tài khoản nội bộ nào.
                  </TableCell>
                </TableRow>
              )}
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.email}
                    {account.id === admin.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(bạn)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{roleLabel[account.role]}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(account.createdAt)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.lastSignInAt ? formatDateTime(account.lastSignInAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <AccountRoleSelect
                      userId={account.id}
                      role={account.role}
                      disabled={account.id === admin.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
