import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

// Endpoint compatível com protocolo OsmAnd (Traccar Client)
// URL: /api/ingest
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const data = req.method === 'POST' ? req.body : req.query;
  const { id, lat, lon, speed, batt } = data;

  // Validação
  if (!id || !lat || !lon) {
    return res.status(400).send('Dados insuficientes. Necessário: id, lat, lon');
  }

  // Sanitização do ID (remove espaços que às vezes vêm copiados errados)
  const cleanId = (id as string).trim();

  try {
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);
    const rawSpeed = parseFloat((speed as string) || '0');
    const speedKmh = Math.round(rawSpeed * 3.6); 
    const battery = batt ? parseFloat(batt as string) : null;
    const status = speedKmh > 2 ? 'Em Movimento' : 'Parado';

    let query = `
      UPDATE vehicles 
      SET 
        lat = $1, 
        lng = $2, 
        speed = $3, 
        last_update = NOW(),
        status = $4
    `;
    
    const params: any[] = [latitude, longitude, speedKmh, status];
    let paramIndex = 5;

    if (battery !== null) {
        query += `, fuel_level = $${paramIndex}`;
        params.push(battery);
        paramIndex++;
    }

    query += ` WHERE tracker_id = $${paramIndex}`;
    params.push(cleanId);

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
       console.log(`[INGEST] Ignorado: Tracker ID '${cleanId}' não encontrado no banco.`);
       return res.status(200).send('Dispositivo não cadastrado, ignorado.');
    }

    console.log(`[INGEST] Sucesso: Veículo atualizado via Tracker ID '${cleanId}'`);
    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('[INGEST] Erro:', error);
    return res.status(500).send(error.message);
  }
}