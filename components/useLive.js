'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '../lib/supabase-browser';

// Starts with the rows baked into the page at build time (good for Google and fast first paint),
// then quietly swaps in the latest rows from Supabase.
export function useLive(table, initial, orderBy, mapRow) {
  const [rows, setRows] = useState(initial);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return undefined;
    let cancelled = false;
    supabase
      .from(table)
      .select('*')
      .order(orderBy)
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setRows(data.map(mapRow));
      });
    return () => {
      cancelled = true;
    };
  }, [table, orderBy, mapRow]);

  return rows;
}
