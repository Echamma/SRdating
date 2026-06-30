import { NextResponse } from "next/server";

import {
  getTrimmedFormValue,
  isValidEmail,
  redirectWithAuthStatus,
} from "@/lib/auth-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MIN_PASSWORD_LENGTH = 6;

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = getTrimmedFormValue(formData, "email");
  const password = getTrimmedFormValue(formData, "password");
  const confirmPassword = getTrimmedFormValue(formData, "confirmPassword");

  if (!isValidEmail(email)) {
    return redirectWithAuthStatus(request, "invalid-email");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return redirectWithAuthStatus(request, "invalid-password");
  }

  if (password !== confirmPassword) {
    return redirectWithAuthStatus(request, "password-mismatch");
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", "/browse");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return redirectWithAuthStatus(
      request,
      "signup-error",
      error.code ?? error.message,
      error.message,
    );
  }

  if (data.session) {
    return NextResponse.redirect(new URL("/browse", request.url));
  }

  return redirectWithAuthStatus(request, "signup-check-email");
}
