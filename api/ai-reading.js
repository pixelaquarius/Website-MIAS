// /api/ai-reading.js (Vercel Serverless Function)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { cards, question, meta } = req.body || {};

    if (!Array.isArray(cards) || cards.length === 0 || !question) {
      return res.status(400).json({ error: 'Invalid payload: require cards[] and question' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }

    const prompt = buildPrompt(cards, question, meta);

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    try {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch (err) {
      return res.status(500).json({ error: 'Bad AI JSON', raw: data });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function buildPrompt(cards, question, meta) {
  const list = cards.map(c => `${c.name} (${c.position || 'upright'})`).join(', ');
  return `
Bạn là một Tarot reader chuyên nghiệp. Tôi bóc ${cards.length} lá bài: ${list}.
Câu hỏi: ${question}.
${meta ? `Ngữ cảnh bổ sung: ${meta}` : ''}
Hãy trả lời bằng JSON với cấu trúc:
{
  "cardInterpretations": [
    { "cardName": "Tên lá", "interpretation": "Ý nghĩa cho câu hỏi" }
  ],
  "overallInterpretation": "Tổng quan tình huống 2-3 câu",
  "nextStepsSuggestion": "Gợi ý hành động cụ thể"
}
`;
}
