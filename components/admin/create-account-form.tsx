"use client";

import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccountAction } from "@/app/admin/(dashboard)/accounts/actions";
import type { AdminRole } from "@/lib/auth";

export function CreateAccountForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<AdminRole>("nhan_vien");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const result = await createAccountAction({ email, password, role });

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setEmail("");
    setPassword("");
    setRole("nhan_vien");
    setSuccess(true);
    setIsSubmitting(false);
  }

  return (
    <Card className="p-6">
      <h2 className="text-sm font-medium">Thêm tài khoản mới</h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_10rem_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="new-account-email">Email</Label>
          <Input
            id="new-account-email"
            type="email"
            autoComplete="off"
            required
            value={email}
            onChange={(e) => {
              setSuccess(false);
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-account-password">Mật khẩu</Label>
          <Input
            id="new-account-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setSuccess(false);
              setPassword(e.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Vai trò</Label>
          <Select value={role} onValueChange={(value) => value && setRole(value as AdminRole)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nhan_vien">Nhân viên</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <UserPlus className="size-4" />
          {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-700">Đã tạo tài khoản mới.</p>}
    </Card>
  );
}
