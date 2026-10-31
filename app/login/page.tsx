"use client";

import React from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/google-icon";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleGoogleLogin() {
    setError(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError("Không thể đăng nhập bằng Google, vui lòng thử lại.");
      setIsLoading(false);
    }
    // On success the browser navigates away to Google's consent screen, so
    // there's no "success" state to show here.
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 pb-24 pt-40 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Đăng nhập Cổng hồ sơ</h1>
        <p className="mt-2 text-balance text-muted-foreground">
          Đăng nhập bằng tài khoản Google để nộp và theo dõi hồ sơ du học của bạn.
        </p>

        <Card className="mt-8 w-full p-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={isLoading}
            onClick={handleGoogleLogin}
          >
            <GoogleIcon className="size-5" />
            {isLoading ? "Đang chuyển hướng..." : "Đăng nhập bằng Google"}
          </Button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
