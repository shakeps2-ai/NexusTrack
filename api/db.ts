import { Pool } from 'pg';

// A variável DATABASE_URL deve ser configurada no painel da Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para conexão segura com Neon
  }
});

export default pool;