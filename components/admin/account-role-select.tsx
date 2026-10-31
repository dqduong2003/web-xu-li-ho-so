"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAccountRoleAction } from "@/app/admin/(dashboard)/accounts/actions";
import type { AdminRole } from "@/lib/auth";

const roleOptions: { value: AdminRole; label: string }[] = [
  { value: "admin", label: "Quản trị viên" },
  { value: "nhan_vien", label: "Nhân viên" },
];

export function AccountRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: AdminRole;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string | null) {
    if (!value || value === role) return;
    setError(null);
    startTransition(async () => {
      const result = await updateAccountRoleAction(userId, value as AdminRole);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Select value={role} onValueChange={handleChange} disabled={disabled || isPending}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
