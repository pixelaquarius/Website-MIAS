// api/ai-reading.js  (Vercel Serverless Function - Node.js)
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { cards, question, meta } = req.body || {};
    if (!Array.isArray(cards) || cards.length === 0 || !question) {
      return res.status(400).json({ error: 'Invalid payload: require cards[] and question' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

    const prompt = buildPrompt(cards, question, meta);

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            cardInterpretations: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  cardName: { type: 'STRING' },
                  interpretation: { type: 'STRING' }
                }
              }
            },
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

    const text = await resp.text(); // đọc text để kiểm soát lỗi JSON gắt gao
    if (!resp.ok) {
      // Trả lại upstream error
      return res.status(502).json({ error: `Upstream ${resp.status}: ${text.slice(0,120)}` });
    }

    try {
      const data = JSON.parse(text);
      const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      try {
        const json = JSON.parse(out);
        return res.status(200).json(json);
      } catch {
        return res.status(500).json({ error: 'Bad AI JSON' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Unexpected upstream format' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}

function buildPrompt(cards, question, meta) {
  const n = cards.length;
  const list = cards.join(', ');
  const mode = meta?.mode || 'single';

  let header = `Bạn là Tarot reader chuyên nghiệp. Tôi có ${n} lá: "${list}". Câu hỏi: "${question}".`;

  if (mode === 'deep' && Array.isArray(meta?.rounds)) {
    const roundsText = meta.rounds.map((r,i)=>`L${i+1}=[${r.join(', ')}]`).join('; ');
    header += `\nNgữ cảnh: CHẾ ĐỘ DEEP nhiều lần. Các lượt đã rút: ${roundsText}. Hãy phân tích liên hệ giữa các lượt.`;
  }

  if (mode === 'combine' && Array.isArray(meta?.rounds)) {
    const roundsText = meta.rounds.map((r,i)=>`L${i+1}=[${r.join(', ')}]`).join('; ');
    header += `\nYêu cầu: HÃY TẠO TỔNG QUAN KẾT HỢP (4–5 câu) dựa trên TẤT CẢ các lượt sau: ${roundsText}. Nêu xu hướng chung, điểm chuyển biến giữa các lượt và rút ra bài học chính.`;
  }

  const wantBrief = mode === 'combine';
  const items = cards.map((c,i)=>`{ "cardName": "${c}", "interpretation": "${wantBrief ? 'Điểm nhấn ngắn gọn cho lá này trong bức tranh tổng thể.' : `Giải thích lá ${i+1} (${c}) theo bối cảnh câu hỏi.`}" }`).join(',');

  const overallHint =
    mode === 'combine'
      ? 'Viết đúng 4–5 câu, súc tích, tổng hợp các lượt, nêu chuyển biến và kết luận.'
      : 'Tóm tắt rõ ràng, trả lời trực tiếp câu hỏi.';

  return `${header}
Trả lời CHỈ BẰNG JSON hợp lệ:
{
  "cardInterpretations": [ ${items} ],
  "overallInterpretation": "${overallHint}",
  "nextStepsSuggestion": "Đưa 1–2 gợi ý hành động tiếp theo, thực tế và khả thi."
}`;
}
