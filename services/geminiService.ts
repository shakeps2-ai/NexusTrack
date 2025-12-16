import { GoogleGenAI } from "@google/genai";
import { Vehicle, Driver, Alert } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeFleet = async (
  query: string,
  vehicles: Vehicle[],
  drivers: Driver[],
  alerts: Alert[]
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Chave da API não configurada. Por favor, configure sua API Key.";

  const contextData = {
    currentTime: new Date().toLocaleString('pt-BR'),
    summary: {
       totalVehicles: vehicles.length,
       moving: vehicles.filter(v => v.status === 'Em Movimento').length,
       stopped: vehicles.filter(v => v.status === 'Parado').length
    },
    vehicles: vehicles.map(v => ({
        plate: v.plate,
        model: v.model,
        status: v.status,
        fuel: `${v.fuelLevel}%`,
        speed: `${v.speed} km/h`
    })),
    drivers: drivers.map(d => ({
        name: d.name,
        status: d.status,
        rating: d.rating
    })),
    recentAlerts: alerts.filter(a => !a.resolved).map(a => ({
        type: a.type,
        severity: a.severity,
        time: a.timestamp
    }))
  };

  const systemInstruction = `
    Você é o NexusAI, um assistente inteligente especializado em gestão de frotas para a plataforma NexusTrack Premium.
    Responda sempre em Português do Brasil.
    
    ESTILO:
    - Seja conciso, executivo e direto ao ponto.
    - Use formatação Markdown (negrito, listas, tabelas) para facilitar a leitura.
    - Se perguntarem sobre um veículo específico, procure na lista fornecida.
    - Se não souber a resposta com base nos dados, informe que não tem essa informação no momento.
    
    DADOS EM TEMPO REAL:
    ${JSON.stringify(contextData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao conectar com a Inteligência Artificial. Verifique sua conexão ou tente novamente.";
  }
};