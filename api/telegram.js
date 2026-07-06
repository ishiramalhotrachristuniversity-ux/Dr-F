const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Dr. Ford Academy Bot is running!');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  try {
    const body = req.body;
    const chatId = body?.message?.chat?.id;
    const userText = body?.message?.text;

    if (!userText) return res.status(200).json({ success: true });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const systemInstruction = "شما دستیار هوشمند و مشاور آموزشی «مدرسه هوش مصنوعی دکتر فورد» هستید. لحن شما حرفه‌ای، مینیمال، و مدیریتی است. تمرکز شما روی دوره‌های فیلم‌سازی، طراحی صنعتی و ایجنت‌های هوشمند است.";
    
    const result = await model.generateContent(`${systemInstruction}\n\nکاربر: ${userText}\nمشاور:`);
    const aiResponse = await result.response.text();

    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: aiResponse }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
