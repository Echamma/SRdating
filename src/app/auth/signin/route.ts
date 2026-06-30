import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getTrimmedFormValue,
  isValidEmail,
  redirectWithAuthStatus,
} from "@/lib/auth-form";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = getTrimmedFormValue(formData, "email");
  const password = getTrimmedFormValue(formData, "password");

  if (!isValidEmail(email)) {
    return redirectWithAuthStatus(request, "invalid-email");
  }

  if (!password) {
    return redirectWithAuthStatus(request, "invalid-password");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirectWithAuthStatus(
      request,
      "signin-error",
      error.code ?? error.message,
      error.message,
    );
  }

  return NextResponse.redirect(new URL("/browse", request.url));
}
