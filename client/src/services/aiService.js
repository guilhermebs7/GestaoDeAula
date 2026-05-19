// frontend/src/services/aiService.js
export async function gerarRecomendacoesApi({ titulo, disciplina, resumo, timeoutMs = 15000 }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('/ai/recomendacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, disciplina, resumo }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 503) {
        throw new Error('IA temporariamente indisponível. Tente novamente em instantes.');
      }
      throw new Error(`IA retornou erro: ${res.status} ${text}`);
    }

    const json = await res.json();
    return json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Tempo de resposta da IA excedido. Tente novamente mais tarde.');
    }
    throw err;
  }
}