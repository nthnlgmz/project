// Reads products and booths from Supabase while the site is being built.
import Core from '../public/fundys-core.js';
import { serverClient } from './supabase-server';

export async function getAllProducts() {
  const { data, error } = await serverClient().from('products').select('*').order('sort_order');
  if (error) throw new Error('Could not load products from Supabase: ' + error.message);
  return (data || []).map(Core.productFromRow);
}

export async function getProducts() {
  return (await getAllProducts()).filter(Core.isVisible);
}

export async function getBooths() {
  const { data, error } = await serverClient().from('booths').select('*').order('start_date');
  if (error) throw new Error('Could not load booths from Supabase: ' + error.message);
  return Core.sortBooths((data || []).map(Core.boothFromRow));
}
