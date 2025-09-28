import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://syusqcaslrxdkwaqsdks.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dXNxY2FzbHJ4ZGt3YXFzZGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTc1MjgsImV4cCI6MjA3NDQ5MzUyOH0.LRh5wNTis6X7bJRMYvzvVEc3ytjjM6wQAM3oYHKd2Us";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);