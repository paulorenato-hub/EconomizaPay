import { createClient } from '@supabase/supabase-js';

// Essas variáveis devem ser configuradas no ambiente de deploy
const supabaseUrl = process.env.SUPABASE_URL || 'https://frewwvurtprtpltjtujm.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZXd3dnVydHBydHBsdGp0dWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTc0NjAsImV4cCI6MjA4NjQ3MzQ2MH0.VWnLZuj0c7Wti2KheR2orf5SH9b9NyLbpvYZ14O-vnc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);