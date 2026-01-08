import { createClient } from "@supabase/supabase-js";

// These come from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ALlows us to access the supabase client. Is exported as a variable
// so we can access in other files.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
