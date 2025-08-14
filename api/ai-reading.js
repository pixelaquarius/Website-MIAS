// api/ai-reading.js  (Vercel Serverless Function - Node.js)
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { cards, question } = req.body || {};
    if (!Array.isArray(cards) || !question) return res.status(400).json({ error: 'Invalid payload' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing server API key' });

    const prompt = buildPrompt(cards, question);
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            cardInterpretations: { type: 'ARRAY', items: { type: 'OBJECT', properties: {
              cardName: { type: 'STRING' }, interpretation: { type: 'STRING' } } } },
            overallInterpretation: { type: 'STRING' },
            nextStepsSuggestion: { type: 'STRING' }
          }
        }
      }
    };

    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=' + apiKey,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );

    if (!resp.ok) return res.status(502).json({ error: `Upstream ${resp.status}` });

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      return res.status(500).json({ error: 'Bad AI JSON' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}

function buildPrompt(cards, question) {
  const n = cards.length;
  const list = cards.join(', ');
  const items = cards.map((c,i)=>`{ "cardName": "${c}", "interpretation": "Giải thích lá ${i+1} (${c})..." }`).join(',');
  return `Bạn là Tarot reader chuyên nghiệp. Tôi bóc ${n} lá: "${list}". Câu hỏi: "${question}".
Trả lời CHỈ BẰNG JSON:
{
  "cardInterpretations": [ ${items} ],
  "overallInterpretation": "Tổng quan...",
  "nextStepsSuggestion": "Gợi ý hành động..."
}`;
}
