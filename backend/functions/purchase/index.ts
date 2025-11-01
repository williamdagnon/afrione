// Supabase Edge Function (Deno) - purchase
// Vérifie le token du user puis appelle la fonction SQL attempt_purchase

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

serve(async (req: Request) => {
  try {
    // Check method
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization token' }), { status: 401 });

    // Get user from token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) {
      return new Response(JSON.stringify({ error: 'Invalid token', details: userErr.message }), { status: 401 });
    }

    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

    const body = await req.json().catch(() => ({}));
    const productId = body.productId || body.product_id || body.product;
    if (!productId) return new Response(JSON.stringify({ error: 'Missing productId in body' }), { status: 400 });

    // Call RPC attempt_purchase
    const { data: rpcData, error: rpcError } = await supabase.rpc('attempt_purchase', { p_user: user.id, p_product_id: Number(productId) });

    if (rpcError) {
      return new Response(JSON.stringify({ error: 'Purchase failed', details: rpcError.message }), { status: 500 });
    }

    // rpcData is expected to be a string like 'ok', 'insufficient', 'no_profile'
    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    return new Response(JSON.stringify({ result }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Unexpected error', details: err.message }), { status: 500 });
  }
});
