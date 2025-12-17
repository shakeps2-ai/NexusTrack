
import { createClient } from '@supabase/supabase-js';

// URL extraída do seu connection string: db.jaktghfszkoqnakxeqdf.supabase.co
const SUPABASE_URL = 'https://jaktghfszkoqnakxeqdf.supabase.co';

// ATENÇÃO: Para o frontend funcionar, você precisa da 'anon public key'.
// A string de conexão 'postgresql://' não funciona no browser.
// Vá em Settings > API no painel do Supabase e copie a chave 'anon' 'public'.
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || 'SUA_CHAVE_ANON_PUBLICA_AQUI'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
