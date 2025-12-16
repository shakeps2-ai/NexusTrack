import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: Listar veículos
  if (req.method === 'GET') {
    try {
        const result = await pool.query('SELECT * FROM vehicles');
        const vehicles = result.rows.map(v => ({
            id: v.id,
            plate: v.plate,
            model: v.model,
            trackerId: v.tracker_id,
            status: v.status,
            speed: v.speed,
            fuelLevel: v.fuel_level,
            ignition: v.speed > 0, // Simplificação
            isLocked: v.is_locked,
            geofenceActive: v.geofence_active,
            geofenceRadius: v.geofence_radius,
            location: { lat: v.lat, lng: v.lng },
            lastUpdate: new Date(v.last_update).toLocaleTimeString('pt-BR')
        }));
        return res.status(200).json(vehicles);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
  }

  // POST: Adicionar/Atualizar veículo
  if (req.method === 'POST') {
      const { id, plate, model, trackerId, status, lat, lng, fuelLevel, isLocked, action } = req.body;

      try {
          if (action === 'delete') {
              await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
              return res.status(200).json({ success: true });
          }
          
          if (action === 'toggleLock') {
             await pool.query('UPDATE vehicles SET is_locked = NOT is_locked WHERE id = $1', [id]);
             return res.status(200).json({ success: true });
          }

          // Insert or Update (Upsert)
          const query = `
            INSERT INTO vehicles (id, plate, model, tracker_id, status, lat, lng, fuel_level, is_locked, last_update)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            ON CONFLICT (id) DO UPDATE SET
              plate = EXCLUDED.plate,
              model = EXCLUDED.model,
              status = EXCLUDED.status,
              lat = EXCLUDED.lat,
              lng = EXCLUDED.lng,
              fuel_level = EXCLUDED.fuel_level,
              last_update = NOW();
          `;
          
          await pool.query(query, [id, plate, model, trackerId, status, lat, lng, fuelLevel, isLocked || false]);
          return res.status(200).json({ success: true });

      } catch (e: any) {
          return res.status(500).json({ error: e.message });
      }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}