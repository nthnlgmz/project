// Supabase client for shoppers signing in with Google. It uses its own storage key, so a shopper session
// never mixes with the admin session on /admin.html (same site, same browser).
import { createClient } from '@supabase/supabase-js';

let client = null;

export function getCustomerClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || typeof window === 'undefined') return null;
  client = createClient(url, key, { auth: { storageKey: 'fundys-customer-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}
