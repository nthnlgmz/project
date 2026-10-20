'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCustomerClient } from '../lib/customer-auth';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const c = getCustomerClient();
    setClient(c);
    if (!c) { setReady(true); return undefined; }
    let alive = true;
    c.auth.getSession().then(({ data }) => { if (alive) { setSession(data.session); setReady(true); } });
    const { data: sub } = c.auth.onAuthStateChange((_event, s) => { if (alive) setSession(s); });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  // Sends the shopper to Google, then back to `path` (default: the page they are on).
  // That address must be allowed in Supabase > Authentication > URL Configuration > Redirect URLs.
  const signIn = useCallback(async (path) => {
    if (!client) return { error: new Error('unavailable') };
    const target = window.location.origin + (path || window.location.pathname + window.location.search);
    return client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: target, queryParams: { prompt: 'select_account' } } });
  }, [client]);

  const signOut = useCallback(() => (client ? client.auth.signOut() : Promise.resolve()), [client]);

  const value = useMemo(() => ({
    client, ready, signIn, signOut, available: !!client,
    user: (session && session.user) || null,
    token: (session && session.access_token) || null,
  }), [client, session, ready, signIn, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used inside <AuthProvider>');
  return c;
}

export const displayName = (user) => {
  const m = (user && user.user_metadata) || {};
  return m.full_name || m.name || '';
};
