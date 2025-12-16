import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

// Endpoint compatível com protocolo OsmAnd (usado pelo Traccar Client)
// URL para configurar no App: https://seu-app.vercel.app/api/ingest
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Suporta GET (comum em rastreadores físicos) e POST (comum em apps)
  const data = req.method === 'POST' ? req.body : req.query;

  // Parâmetros do protocolo OsmAnd / Traccar
  // id: Identificador único do dispositivo (IMEI ou ID gerado no app)
  // lat: Latitude
  // lon: Longitude
  // speed: Velocidade (geralmente em m/s ou nós)
  // batt: Nível de bateria (opcional)
  // timestamp: Data hora (opcional, se não vier usamos NOW())
  const { id, lat, lon, speed, batt } = data;

  // Validação básica
  if (!id || !lat || !lon) {
    return res.status(400).send('Dados insuficientes. Necessário: id, lat, lon');
  }

  try {
    // Conversão de dados
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);
    
    // Traccar Client (OsmAnd) geralmente envia velocidade em m/s. 
    // Multiplicamos por 3.6 para obter km/h.
    const rawSpeed = parseFloat((speed as string) || '0');
    const speedKmh = Math.round(rawSpeed * 3.6); 
    
    // Se vier bateria, usamos como nível de combustível (para celulares)
    const battery = batt ? parseFloat(batt as string) : null;
    
    // Lógica simples de status baseada na velocidade
    // Se > 2km/h, consideramos em movimento
    const status = speedKmh > 2 ? 'Em Movimento' : 'Parado';

    // Query de atualização
    // Busca o veículo pelo tracker_id e atualiza posição e status
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

    // Apenas atualiza bateria/combustível se o dado foi enviado
    if (battery !== null) {
        query += `, fuel_level = $${paramIndex}`;
        params.push(battery);
        paramIndex++;
    }

    query += ` WHERE tracker_id = $${paramIndex}`;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
       // Dispositivo enviou dados, mas não está cadastrado no painel
       console.log(`Recebido dados de ID desconhecido: ${id}`);
       // Retornamos 200 para o rastreador não ficar tentando reenviar infinitamente (fila),
       // mas não salvamos nada.
       return res.status(200).send('Dispositivo não cadastrado, ignorado.');
    }

    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('Erro de ingestão:', error);
    return res.status(500).send(error.message);
  }
}