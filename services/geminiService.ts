
import { GoogleGenAI } from "@google/genai";
import { Vehicle, Driver, Alert, VehicleStatus } from '../types';

// --- CONFIGURAÇÃO ---
// O modelo Flash é otimizado para velocidade e baixo custo (Free Tier disponível)
const MODEL_NAME = 'gemini-2.5-flash';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  // Se não houver chave, retornamos null para ativar o modo Local
  if (!apiKey || apiKey === 'undefined' || apiKey === '') return null;
  return new GoogleGenAI({ apiKey });
};

// --- MOCK INTELLIGENCE (Modo Gratuito/Local) ---
// Funciona sem API Key, analisando os dados via Regex e Lógica
const mockFleetAnalysis = (query: string, vehicles: Vehicle[], drivers: Driver[], alerts: Alert[]): string => {
    const q = query.toLowerCase();
    const movingCount = vehicles.filter(v => v.status === VehicleStatus.MOVING).length;
    const stoppedCount = vehicles.filter(v => v.status === VehicleStatus.STOPPED).length;
    const alertCount = alerts.filter(a => !a.resolved).length;
    const totalVehicles = vehicles.length;
    
    // Análise de Combustível
    if (q.includes('combustível') || q.includes('abastecer') || q.includes('tanque')) {
        const lowFuel = vehicles.filter(v => v.fuelLevel < 20);
        const avgFuel = Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / (totalVehicles || 1));
        
        if (lowFuel.length > 0) {
            return `### Análise de Combustível ⛽\n\nIdentifiquei **${lowFuel.length} veículos** com nível crítico (abaixo de 20%):\n` +
                   lowFuel.map(v => `- **${v.model} (${v.plate})**: ${v.fuelLevel}%`).join('\n') +
                   `\n\nA média da frota é de **${avgFuel}%**. Recomendo roteirizar abastecimento imediato para os veículos citados.`;
        }
        return `O nível de combustível da frota está estável, com média de **${avgFuel}%**. Nenhum veículo está na reserva no momento.`;
    }

    // Análise de Velocidade/Segurança
    if (q.includes('velocidade') || q.includes('rápido') || q.includes('multa') || q.includes('segurança')) {
        const speeding = vehicles.filter(v => v.speed > 80);
        if (speeding.length > 0) {
            return `### Alerta de Segurança ⚠️\n\nDetectei **${speeding.length} veículos** acima de 80 km/h neste momento:\n` +
                   speeding.map(v => `- **${v.model} (${v.plate})**: ${Math.round(v.speed)} km/h`).join('\n') +
                   `\n\nRecomendo contatar os motoristas imediatamente para evitar infrações e acidentes.`;
        }
        return `Todos os veículos estão respeitando os limites de velocidade no momento. A velocidade máxima registrada é de **${Math.max(...vehicles.map(v => v.speed), 0)} km/h**.`;
    }

    // Análise de Motoristas
    if (q.includes('motorista') || q.includes('condutor') || q.includes('equipe')) {
        const bestDrivers = [...drivers].sort((a, b) => b.rating - a.rating).slice(0, 3);
        return `### Performance da Equipe 👨‍✈️\n\nAtualmente temos **${drivers.length} motoristas** cadastrados.\n\n**Top 3 Melhores Avaliados:**\n` +
               bestDrivers.map((d, i) => `${i+1}. **${d.name}**: ⭐ ${d.rating.toFixed(1)}`).join('\n');
    }

    // Análise de Manutenção/Alertas
    if (q.includes('alerta') || q.includes('manutenção') || q.includes('problema') || q.includes('atenção')) {
        if (alertCount === 0) return "Tudo tranquilo! Não há alertas pendentes ou manutenções urgentes no sistema.";
        
        const critical = alerts.filter(a => !a.resolved && a.severity === 'high');
        return `### Resumo de Alertas 🔔\n\nTemos **${alertCount} alertas** pendentes.\n` +
               (critical.length > 0 ? `\n**Críticos (${critical.length}):**\n` + critical.map(a => `- ${a.type} em ${a.vehicleId}`).join('\n') : '') +
               `\n\nVerifique a aba de Notificações para resolver estas pendências.`;
    }

    // Resumo Geral (Default)
    return `### Resumo da Operação NexusTrack 🌐\n\n` +
           `- **Total de Veículos:** ${totalVehicles}\n` +
           `- **Em Movimento:** ${movingCount} 🟢\n` +
           `- **Parados:** ${stoppedCount} 🟡\n` +
           `- **Alertas Pendentes:** ${alertCount} ${alertCount > 0 ? '🔴' : '⚪'}\n\n` +
           `Estou operando em **Modo Local**. Para análises mais profundas, configure sua API Key do Google Gemini no Vercel. Como posso ajudar mais?`;
};

// --- FUNÇÃO PRINCIPAL ---

export const analyzeFleet = async (
  query: string,
  vehicles: Vehicle[],
  drivers: Driver[],
  alerts: Alert[]
): Promise<string> => {
  const ai = getAiClient();

  // 1. FALLBACK LOCAL (Se não houver API Key configurada)
  if (!ai) {
    console.log("NexusAI: Running in Local Mode (No API Key)");
    // Simula um delay de rede para parecer processamento real
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockFleetAnalysis(query, vehicles, drivers, alerts);
  }

  // 2. GEMINI API (Se houver API Key)
  const contextData = {
    currentTime: new Date().toLocaleString('pt-BR'),
    summary: {
       totalVehicles: vehicles.length,
       moving: vehicles.filter(v => v.status === VehicleStatus.MOVING).length,
       stopped: vehicles.filter(v => v.status === VehicleStatus.STOPPED).length,
       averageFuel: Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / (vehicles.length || 1))
    },
    vehicles: vehicles.map(v => ({
        plate: v.plate,
        model: v.model,
        status: v.status,
        fuel: `${v.fuelLevel}%`,
        speed: `${Math.round(v.speed)} km/h`,
        driver: drivers.find(d => d.id === v.driverId)?.name || 'Sem motorista'
    })),
    drivers: drivers.map(d => ({
        name: d.name,
        status: d.status,
        rating: d.rating
    })),
    recentAlerts: alerts.filter(a => !a.resolved).slice(0, 5).map(a => ({
        type: a.type,
        severity: a.severity,
        desc: a.description
    }))
  };

  const systemInstruction = `
    Você é o NexusAI, a inteligência central da plataforma NexusTrack Premium.
    Analise os dados JSON fornecidos e responda à pergunta do gestor de frota.
    
    DIRETRIZES:
    - Responda em Português do Brasil.
    - Seja direto, profissional e use Markdown (negrito, listas) para formatar.
    - Se encontrar situações críticas (combustível baixo < 20%, velocidade > 100km/h), destaque-as.
    - Use emojis para tornar a leitura agradável.
    
    DADOS DA FROTA (JSON):
    ${JSON.stringify(contextData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Mais preciso
        maxOutputTokens: 500,
      }
    });

    return response.text || "Não consegui analisar os dados no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    // Em caso de erro na API (cota excedida, erro de rede), faz fallback para o mock
    return mockFleetAnalysis(query, vehicles, drivers, alerts);
  }
};
