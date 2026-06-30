import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("status", "signedout");

  return NextResponse.redirect(redirectUrl);
}
