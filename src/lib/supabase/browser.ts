"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getEnv, getSupabasePublishableKey } from "@/lib/env";
import type { Database } from "@/types/database";

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      getEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getSupabasePublishableKey(),
    );
  }

  return browserClient;
}
