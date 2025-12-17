
import { GoogleGenAI } from "@google/genai";
import { Vehicle, Driver, Alert, VehicleStatus } from '../types';

// --- CONFIGURAÇÃO ---
// Fix: Use recommended model for basic text analysis tasks
const MODEL_NAME = 'gemini-3-flash-preview';

// Interface de Resposta Híbrida
export interface AIResponse {
  text: string;
  source: 'cloud' | 'local';
}

const getAiClient = () => {
  // Fix: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') return null;
  return new GoogleGenAI({ apiKey });
};

// --- MOCK INTELLIGENCE (Modo Local - "A Outra Funcional") ---
const mockFleetAnalysis = (query: string, vehicles: Vehicle[], drivers: Driver[], alerts: Alert[]): string => {
    const q = query.toLowerCase();
    const movingCount = vehicles.filter(v => v.status === VehicleStatus.MOVING).length;
    const totalVehicles = vehicles.length;
    const avgFuel = Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / (totalVehicles || 1));
    const alertCount = alerts.filter(a => !a.resolved).length;

    // Resposta Padrão Inteligente Local
    if (q.includes('resumo') || q.includes('geral') || q.includes('status')) {
       return `### 🧠 Nexus Local Intelligence\n\n` +
              `**Status da Frota:**\n` +
              `- Total: ${totalVehicles} veículos\n` +
              `- Em Operação: ${movingCount} ativos\n` +
              `- Média de Combustível: ${avgFuel}%\n\n` +
              `Detectei **${alertCount} alertas pendentes** que requerem sua atenção. O sistema está operando em modo local com máxima performance.`;
    }

    if (q.includes('combustível') || q.includes('abastecer')) {
        const lowFuel = vehicles.filter(v => v.fuelLevel < 20);
        if (lowFuel.length > 0) {
            return `### ⛽ Análise de Combustível (Local)\n\nIdentifiquei **${lowFuel.length} veículos** críticos:\n` +
                   lowFuel.map(v => `- ${v.plate}: ${v.fuelLevel}%`).join('\n') + 
                   `\n\nSugiro agendar abastecimento.`;
        }
        return `Nível de combustível estável (Média: ${avgFuel}%). Nenhum veículo em reserva crítica.`;
    }

    if (q.includes('alerta') || q.includes('problema')) {
        if (alertCount === 0) return "✅ Não há alertas pendentes no momento. Operação segura.";
        return `### ⚠️ Central de Alertas (Local)\n\nTemos **${alertCount} ocorrências** não resolvidas. Verifique a aba de Notificações para detalhes de excesso de velocidade ou cerca virtual.`;
    }

    return `### 🧠 Nexus AI (Modo Local)\n\n` +
           `Estou analisando sua frota internamente:\n` +
           `- **${movingCount}** veículos em trânsito\n` +
           `- **${avgFuel}%** média de combustível\n\n` +
           `A chave de API configurada não retornou dados da nuvem, mas estou funcional e operando com dados locais. Como posso ajudar?`;
};

// --- FUNÇÃO PRINCIPAL ---
export const analyzeFleet = async (
  query: string,
  vehicles: Vehicle[],
  drivers: Driver[],
  alerts: Alert[]
): Promise<AIResponse> => {
  const ai = getAiClient();

  // 1. FALLBACK LOCAL IMEDIATO (Sem nenhuma chave)
  if (!ai) {
    console.log("NexusAI: Modo Local (Chave não detectada)");
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
        text: mockFleetAnalysis(query, vehicles, drivers, alerts),
        source: 'local'
    };
  }

  // Preparação do Contexto para a IA
  const contextData = {
    timestamp: new Date().toLocaleString('pt-BR'),
    stats: {
       total: vehicles.length,
       moving: vehicles.filter(v => v.status === VehicleStatus.MOVING).length,
       fuelAvg: Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / (vehicles.length || 1))
    },
    alerts_pending: alerts.filter(a => !a.resolved).length,
    critical_alerts: alerts.filter(a => !a.resolved && a.severity === 'high').map(a => a.type)
  };

  const systemInstruction = `
    Você é o NexusAI, analista de frota avançado.
    Dados Atuais: ${JSON.stringify(contextData)}
    
    Diretrizes:
    1. Responda em Português do Brasil.
    2. Seja conciso e executivo.
    3. Use formatação Markdown.
    4. Baseie-se estritamente nos dados fornecidos.
  `;

  try {
    // 2. TENTATIVA NUVEM
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 300,
      }
    });

    // Fix: Access response.text as a property, not a method, as per SDK guidelines.
    return {
        text: response.text || "Sem resposta da nuvem.",
        source: 'cloud'
    };

  } catch (error) {
    console.warn("NexusAI Cloud Error (Ativando Fallback Local):", error);
    // 3. FALLBACK DE ERRO (Garante que "a outra" se mantenha funcional)
    return {
        text: mockFleetAnalysis(query, vehicles, drivers, alerts),
        source: 'local'
    };
  }
};
