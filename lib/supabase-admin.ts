import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL eksik");
  }

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY eksik");
  }

  return createClient(url, key);
}