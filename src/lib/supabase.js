
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yetqpyuknmwlwooeczag.supabase.co';

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHFweXVrbm13bHdvb2VjemFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjE3NzEsImV4cCI6MjA5NTg5Nzc3MX0.ms-cNVZ2TQcpmVSUtFfiA36mG5REEaCbTtQSZV6j0mo';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
