import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Criação da tabela de Usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criação da tabela de Veículos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(50) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        plate VARCHAR(20) NOT NULL,
        model VARCHAR(100),
        tracker_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Parado',
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        speed INTEGER DEFAULT 0,
        fuel_level INTEGER DEFAULT 50,
        is_locked BOOLEAN DEFAULT FALSE,
        geofence_active BOOLEAN DEFAULT FALSE,
        geofence_radius INTEGER DEFAULT 1000,
        last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inserir um usuário padrão se não existir
    // Senha padrão '123456' hash (exemplo simples, em prod use bcrypt no register)
    await pool.query(`
        INSERT INTO users (name, email, password_hash)
        VALUES ('Admin', 'admin@empresa.com', '$2a$10$X.x.x.x.x.x.x.x.x.x.x.x')
        ON CONFLICT (email) DO NOTHING;
    `);

    return res.status(200).json({ message: "Banco de dados configurado com sucesso!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}