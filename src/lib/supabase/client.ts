"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { CompatDatabase } from "@/lib/supabase/types";

export function createClient() {
  return createBrowserClient<CompatDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
