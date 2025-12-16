import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("Iniciando configuração do banco de dados...");

    // 1. Criação da tabela de Usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Criação da tabela de Veículos
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

    // 3. CRUCIAL: Criar índice para busca rápida por ID do Rastreador
    // Isso garante que quando o GPS enviar dados, a atualização seja milimétrica
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vehicles_tracker_id ON vehicles(tracker_id);
    `);

    // 4. Inserir um usuário Admin padrão se não existir
    // Senha padrão '123456' hash
    await pool.query(`
        INSERT INTO users (name, email, password_hash)
        VALUES ('Admin', 'admin@empresa.com', '$2a$10$X.x.x.x.x.x.x.x.x.x.x.x')
        ON CONFLICT (email) DO NOTHING;
    `);

    console.log("Banco de dados configurado com sucesso.");
    return res.status(200).json({ message: "Sincronização com Neon DB concluída com sucesso! Tabelas e Índices criados." });
  } catch (error: any) {
    console.error("Erro no setup:", error);
    return res.status(500).json({ error: error.message, details: "Verifique se a DATABASE_URL está correta no Vercel." });
  }
}