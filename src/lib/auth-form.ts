import { NextResponse } from "next/server";

export function redirectWithAuthStatus(
  request: Request,
  status: string,
  errorCode?: string,
  errorMessage?: string,
) {
  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("status", status);

  if (errorCode) {
    redirectUrl.searchParams.set("error", errorCode);
  }

  if (errorMessage) {
    redirectUrl.searchParams.set("message", errorMessage);
  }

  return NextResponse.redirect(redirectUrl);
}

export function getTrimmedFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function isValidEmail(email: string) {
  return email.includes("@");
}
