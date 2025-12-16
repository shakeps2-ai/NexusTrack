import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { action, email, password, name } = req.body;

    if (action === 'login') {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password_hash)) {
            // Em produção, use JWT. Aqui retornamos sucesso simples.
            return res.status(200).json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
        }
        return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS' });
      } catch (e: any) {
        return res.status(500).json({ success: false, error: e.message });
      }
    }

    if (action === 'register') {
      try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
            [name, email, hash]
        );
        return res.status(200).json({ success: true });
      } catch (e: any) {
        return res.status(500).json({ success: false, error: e.message });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}