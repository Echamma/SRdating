import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { redirectWithAuthStatus } from "@/lib/auth-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/browse";
  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return redirectWithAuthStatus(
        request,
        "callback-error",
        error.code ?? error.message,
        error.message,
      );
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (error) {
      return redirectWithAuthStatus(
        request,
        "callback-error",
        error.code ?? error.message,
        error.message,
      );
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
