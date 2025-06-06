if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_KEY === 'undefined') {
  console.error('Supabase configuration missing.');
} else {
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
