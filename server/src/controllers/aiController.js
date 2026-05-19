// src/controllers/aiController.js
require('dotenv').config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = [
  'models/gemini-2.5-flash',
  'models/gemini-2.0-flash',
  'models/gemini-2.0-flash-lite',
];
const logger = require('../utils/logger');

function extrairJson(texto) {
  if (!texto || typeof texto !== 'string') return null;

  try {
    return JSON.parse(texto);
  } catch (e) {
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch (e2) {
      return null;
    }
  }
}

function normalizarLista(valor, limite) {
  if (!Array.isArray(valor)) return null;

  const lista = valor
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  if (lista.length === 0) return null;

  return typeof limite === 'number' ? lista.slice(0, limite) : lista;
}

function validarRespostaIA(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  const conteudos = normalizarLista(parsed.conteudos, 5);
  const recursosApoio = normalizarLista(parsed.recursosApoio ?? parsed.topicos, 5);
  const tags = normalizarLista(parsed.tags, 3);

  if (!conteudos || !recursosApoio || !tags) return null;

  return {
    conteudos,
    recursosApoio,
    tags,
  };
}

async function gerarComModelo(modelName, prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              }
            ]
          }
        ]
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || `Gemini returned ${response.status}`);
    error.status = response.status;
    error.modelName = modelName;
    error.detail = text;
    throw error;
  }

  return response.json();
}

async function gerarRecomendacoes(req, res) {
  
  const { titulo, disciplina, resumo } = req.body || {};

  const startedAt = Date.now();
  logger.info('AI Request', {
    title: titulo || '',
    discipline: disciplina || '',
    resumoLength: typeof resumo === 'string' ? resumo.length : 0
  });
  
  if (!titulo || !disciplina || !resumo) {
    return res.status(400).json({ error: 'titulo, disciplina e resumo são obrigatórios' });
  }

  if (!GEMINI_KEY) {
    logger.error('AI Missing API Key');
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });
  }

  const systemPrompt = `Você é um assistente educacional experiente. 
Seu trabalho é retornar APENAS um JSON válido com exatamente esta estrutura:
{
  "conteudos": ["conteudo1", "conteudo2", "conteudo3"],
  "recursosApoio": ["recurso1", "recurso2", "recurso3"],
  "tags": ["tag1", "tag2", "tag3"]
}

Não adicione explicações, markdown ou qualquer outro texto. Apenas o JSON.`;

  const userPrompt = `Plano de Aula:
Título: ${titulo}
Disciplina: ${disciplina}
Resumo: ${resumo}

Gere sugestões de conteúdos, recursos de apoio e tags para este plano de aula.`;
  const prompt = `${systemPrompt}\n\n${userPrompt}`;
  
  try {
    let data = null;
    let lastError = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        logger.info('AI Model Attempt', {
          title: titulo || '',
          discipline: disciplina || '',
          model: modelName,
        });

        data = await gerarComModelo(modelName, prompt);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;

        if (error.status !== 503) {
          logger.error('AI Provider Error', {
            model: modelName,
            status: error.status || 'unknown',
            detail: String(error.detail || error.message || '').slice(0, 300)
          });
          break;
        }

        logger.warn('AI Model Unavailable', {
          model: modelName,
          status: error.status,
          detail: String(error.detail || error.message || '').slice(0, 200)
        });
      }
    }

    if (!data) {
      const detail = String(lastError?.detail || lastError?.message || 'IA temporariamente indisponível');
      logger.error('AI All Models Failed', {
        title: titulo || '',
        discipline: disciplina || '',
        detail: detail.slice(0, 300)
      });
      return res.status(503).json({
        error: 'IA temporariamente indisponível. Tente novamente em instantes.',
        detail,
      });
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const tokenUsage = data.usageMetadata?.totalTokenCount ?? data.usageMetadata?.candidatesTokenCount ?? null;
    const latencySeconds = ((Date.now() - startedAt) / 1000).toFixed(1);

    logger.info('AI Response Received', {
      title: titulo || '',
      discipline: disciplina || '',
      tokenUsage: tokenUsage ?? 'unknown',
      latency: `${latencySeconds}s`
    });

    const parsed = extrairJson(content);
    const result = validarRespostaIA(parsed);

    if (!result) {
      logger.error('AI Invalid Response', {
        title: titulo || '',
        discipline: disciplina || '',
        rawPreview: content.substring(0, 150)
      });
      return res.status(502).json({ error: 'Resposta da IA inválida', raw: content });
    }

    logger.info('AI Success', {
      title: titulo || '',
      discipline: disciplina || '',
      tokenUsage: tokenUsage ?? 'unknown',
      latency: `${latencySeconds}s`
    });
    return res.json(result);
  } catch (err) {
    logger.error('AI Request Failed', {
      title: titulo || '',
      discipline: disciplina || '',
      message: err.message
    });
    return res.status(500).json({ error: 'Erro interno ao consultar IA', detail: err.message });
  }
}

module.exports = { gerarRecomendacoes };