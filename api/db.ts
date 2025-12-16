import { Pool } from 'pg';

// Obtém a string de conexão das variáveis de ambiente
let connectionString = process.env.DATABASE_URL;

// TRATAMENTO PARA NEON DB + NODE-POSTGRES
// O driver 'pg' do Node.js não suporta o parâmetro 'channel_binding' nativamente, 
// o que pode causar erro de conexão. Removemos esse parâmetro da string se ele vier.
if (connectionString && connectionString.includes('channel_binding')) {
  connectionString = connectionString.replace(/&?channel_binding=[^&]+/, '').replace(/\?channel_binding=[^&]+/, '?');
}

// Configuração do Pool de Conexão
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Necessário para evitar erros de certificado em ambientes serverless
  },
  max: 10, // Limite de conexões no pool (Serverless precisa ser baixo)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export default pool;