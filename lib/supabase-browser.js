// Supabase client used in the visitor's browser, so edits made in /admin.html show up without a rebuild.
// The anon key is public by design: Row Level Security (supabase/schema.sql) is what protects the data.
import { createClient } from '@supabase/supabase-js';

let client = null;

export function getBrowserClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}
