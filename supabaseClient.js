// Initialize and export the Supabase client for use in modules
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
