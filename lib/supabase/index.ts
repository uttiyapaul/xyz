// lib/supabase/index.ts
// Re-exports the canonical client so both import paths work:
// import { supabase } from '@/lib/supabase'        ← existing pages
// import { supabase } from '@/lib/supabase/client'  ← new pages
export { supabase, createServerSupabaseClient } from './client';