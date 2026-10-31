import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isValidEmail } from "@/lib/validation";
import type { AdminRole } from "@/lib/auth";

export interface InternalAccount {
  id: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  lastSignInAt: string | null;
}

export class AccountError extends Error {}

function parseRole(value: unknown): AdminRole | null {
  return value === "admin" || value === "nhan_vien" ? value : null;
}

// Internal accounts aren't a separate table — they're just Supabase Auth
// users whose app_metadata.role is set (see proxy.ts / lib/auth.ts). Reading
// and managing them goes through the Admin API, which is the only way to
// reach auth.users at all (it isn't exposed via PostgREST/RLS).
export async function listInternalAccounts(): Promise<InternalAccount[]> {
  const supabase = getSupabaseAdmin();
  const accounts: InternalAccount[] = [];
  const perPage = 200;
  let page = 1;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !data) {
      throw new AccountError(`Không tải được danh sách tài khoản: ${error?.message}`);
    }

    for (const user of data.users) {
      const role = parseRole(user.app_metadata?.role);
      if (!role) continue;
      accounts.push({
        id: user.id,
        email: user.email ?? "",
        role,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
      });
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return accounts.sort((a, b) => a.email.localeCompare(b.email));
}

export async function updateAccountRole(userId: string, role: AdminRole): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });

  if (error) {
    throw new AccountError(`Không đổi được vai trò: ${error.message}`);
  }
}

export async function createInternalAccount(input: {
  email: string;
  password: string;
  role: AdminRole;
}): Promise<InternalAccount> {
  const email = input.email.trim();
  if (!isValidEmail(email)) {
    throw new AccountError("Email không đúng định dạng.");
  }
  if (input.password.length < 6) {
    throw new AccountError("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    app_metadata: { role: input.role },
  });

  if (error || !data.user) {
    throw new AccountError(`Không tạo được tài khoản: ${error?.message ?? "lỗi không xác định"}`);
  }

  return {
    id: data.user.id,
    email: data.user.email ?? email,
    role: input.role,
    createdAt: data.user.created_at,
    lastSignInAt: null,
  };
}
