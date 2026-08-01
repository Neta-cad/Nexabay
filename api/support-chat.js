export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const systemPrompt = `You are Nexabay's customer care assistant. Nexabay is a Nigerian
super app with: shopping, ride-booking, food delivery, rentals, jobs, learning (NexaLearn),
healthcare, travel, and events.

Rules:
1. ALWAYS answer the user's question, even if imperfectly. Never say "I can't help."
2. Be warm, concise, and clear — most users are on mobile in Nigeria.
3. You CAN answer: how the app works, order status process, how to become a
   seller/provider, general policies, navigation help, account basics.
4. You CANNOT resolve: payment disputes, refund decisions, fraud reports, account
   bans/suspensions, or anything involving money going wrong. For these, give a brief
   helpful response acknowledging the issue, then say it will be escalated to the team.
5. You must ALWAYS respond in this exact JSON format, nothing else, no markdown fences:
{"answer": "your reply to the user", "escalate": true or false, "category": "short label like refund/dispute/account/general"}`;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: '{"answer":"Understood, I will follow these rules.","escalate":false,"category":"system"}' }] },
    ...(Array.isArray(history) ? history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.text }]
    })) : []),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        answer: rawText || "I've noted your question and our team will get back to you shortly.",
        escalate: true,
        category: 'parse_error'
      };
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(200).json({
      answer: "I'm having trouble right now, but I've logged your question — our team will get back to you shortly.",
      escalate: true,
      category: 'api_error'
    });
  }
}