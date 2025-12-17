
import { createClient } from '@supabase/supabase-js';

// URL do Projeto
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jaktghfszkoqnakxeqdf.supabase.co';

// Chave Anônima Pública
// A chave fornecida foi inserida como fallback caso a variável de ambiente não esteja definida
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impha3RnaGZzemtvcW5ha3hlcWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTk1ODQsImV4cCI6MjA4MTQ5NTU4NH0.l41kfDJ6aDd68iDAAO80OupTPf1sEW8BbNkfwtQlcu8';

if (!SUPABASE_ANON_KEY) {
  console.warn('⚠️ NexusTrack: Chave do Supabase não encontrada.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
