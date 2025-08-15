// /api/ai-reading.js — Vercel Serverless (Node.js). Gọi Gemini 2.0 qua v1beta, trả JSON chuẩn + retry.

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { cards, question, meta } = req.body || {};
    if (!Array.isArray(cards) || cards.length === 0 || !question) {
      return res.status(400).json({ error: "Invalid payload: require cards[] and question" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const prompt = buildPrompt(cards, question, meta);

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
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
        }
      }
    };

    const MODEL = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const data = await callWithRetry(url, payload, 5);

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts?.[0]?.functionCall?.args ??
      "";

    let parsed;
    try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; }
    catch {
      const m = (raw || "").match(/\{[\s\S]*\}$/);
      if (m) parsed = JSON.parse(m[0]);
      else throw new Error("Bad AI JSON");
    }

    return res.status(200).json(parsed);
  } catch (err) {
    const msg = err?.message || "Unknown error";
    const code = /timeout|fetch|aborted/i.test(msg) ? 504 : 500;
    return res.status(code).json({ error: msg });
  }
}

function buildPrompt(cards, question, meta = {}) {
  const list = cards.join(", ");
  const n = meta.spreadCount || cards.length;
  return `
Bạn là Tarot reader chuyên nghiệp. Tôi đã bóc ${n} lá: "${list}". Câu hỏi của tôi: "${question}".
Trả lời CHỈ BẰNG MỘT ĐỐI TƯỢNG JSON hợp lệ theo schema:
{
  "cardInterpretations":[
    {"cardName":"<tên lá>","interpretation":"Giải thích ngắn gọn, súc tích, bám sát câu hỏi."}
  ],
  "overallInterpretation":"Tổng quan khi kết hợp tất cả lá, trả lời trực tiếp câu hỏi.",
  "nextStepsSuggestion":"1-2 gợi ý hành động thiết thực."
}
Không chèn thêm văn bản ngoài JSON.
  `.trim();
}

async function callWithRetry(url, body, maxTry = 5) {
  let attempt = 0;
  while (true) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const text = await resp.text();
      let json;
      try { json = JSON.parse(text); }
      catch {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text.slice(0, 120)}`);
        throw new Error("Non-JSON response from Gemini");
      }

      if (!resp.ok) {
        const msg = json?.error?.message || json?.error || `HTTP ${resp.status}`;
        throw new Error(msg);
      }
      return json;
    } catch (e) {
      attempt++;
      const msg = String(e?.message || e);
      const retriable = /429|5\d\d|timeout|fetch failed|aborted/i.test(msg);
      if (!retriable || attempt >= maxTry) throw e;
      const delay = 800 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
