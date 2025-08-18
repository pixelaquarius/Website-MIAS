// /api/ai-reading.js
export default async function handler(req, res) {
  // CORS cho trường hợp frontend khác origin (GitHub Pages):
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { cards, question, meta } = req.body || {};
    if (!Array.isArray(cards) || cards.length === 0 || !question) {
      return res.status(400).json({ error: 'Invalid payload: require non-empty cards[] and question' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

    const prompt = buildPrompt(cards, question, meta);

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            cardInterpretations: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  cardName: { type: "STRING" },
                  interpretation: { type: "STRING" }
                }
              }
            },
            overallInterpretation: { type: "STRING" },
            nextStepsSuggestion: { type: "STRING" }
          }
        },
        temperature: 0.8,
        topP: 0.9
      }
    };

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const t = await resp.text();
      return res.status(resp.status).json({ error: `Gemini error ${resp.status}`, snippet: t.slice(0,160) });
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: "AI trả về định dạng không phải JSON", snippet: text.slice(0,160) });
    }

    return res.status(200).json(json);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

function buildPrompt(cards, question, meta) {
  const n = cards.length;
  const items = cards.map((c,i)=>`{ "cardName": "${c}", "interpretation": "Giải thích chi tiết, 3–5 câu, liên hệ trực tiếp với câu hỏi." }`).join(", ");
  return `
Bạn là tarot reader chuyên nghiệp. Đây là ${n} lá bài: ${cards.join(", ")}.
Câu hỏi của khách: "${question}".

Trả lời CHỈ BẰNG MỘT JSON hợp lệ với schema:
{
  "cardInterpretations": [ ${items} ],
  "overallInterpretation": "Tổng quan 4–6 câu, tổng hợp ý nghĩa khi các lá kết hợp.",
  "nextStepsSuggestion": "2–3 gợi ý hành động cụ thể, thực tế."
}
Không thêm chú thích hay văn bản ngoài JSON.`;
}
