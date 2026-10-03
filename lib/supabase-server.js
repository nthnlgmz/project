// Supabase client used at BUILD time (to write the page HTML and Google metadata).
import { createClient } from '@supabase/supabase-js';

export function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill them in.'
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
