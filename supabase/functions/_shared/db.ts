import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { env } from "./env.ts";

export function serviceClient() {
  const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_URL nao configurado.");
  return createClient(url, key, { auth: { persistSession: false } });
}
