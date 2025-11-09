// File: /api/getReading.js
// Đây là Serverless Function chạy trên Vercel (Node.js)

export default async function handler(request, response) {
    // 1. Chỉ cho phép phương thức POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Lấy API key từ biến môi trường của Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return response.status(500).json({ error: 'API key is not configured' });
    }

    try {
        // 3. Lấy lịch sử chat và câu hỏi mới từ client gửi lên
        const { contents, generationConfig } = request.body;

        const modelName = "gemini-1.5-flash-latest";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        // 4. Gửi yêu cầu đến Google AI từ server
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, generationConfig }) // Gửi payload mà client đã chuẩn bị
        });

        const result = await apiResponse.json();

        // 5. Gửi kết quả về lại cho trình duyệt (client)
        response.status(200).json(result);

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        response.status(500).json({ error: 'Failed to fetch from AI' });
    }
}
