const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function (req, res) {
  // تاییدیه روشن بودن سرور
  if (req.method !== 'POST') {
    return res.status(200).send('Dr. Ford Academy Bot is running!');
  }

  // دریافت کلیدهای امنیتی
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  try {
    const body = req.body;
    const chatId = body?.message?.chat?.id;
    const userText = body?.message?.text;

    // اگر پیامی نبود عملیات متوقف شود
    if (!userText) return res.status(200).json({ success: true });

    // ۱. ارسال پیام کاربر به مغز هوش مصنوعی
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const systemInstruction = `شما دستیار هوشمند و مشاور آموزشی «مدرسه هوش مصنوعی دکتر فورد» هستید. لحن شما باید حرفه‌ای، دقیق، مینیمال، راهگشا و کاملاً مدیریتی باشد. وظیفه شما راهنمایی کاربران (والدین، دانش‌آموزان و متخصصین) درباره دوره‌های آموزشی هوش مصنوعی است. تمرکز تخصصی دوره‌ها بر حوزه‌های فیلم‌سازی، طراحی صنعتی و مهندسی ایجنت‌های هوشمند (AI Agents) است. اکیداً از به کار بردن ادبیات کودکانه پرهیز کنید. کاربر را به ثبت‌نام راهنمایی کنید.`;
    
    const prompt = `${systemInstruction}\n\nکاربر: ${userText}\nمشاور:`;
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response.text();

    // ۲. ارسال پاسخ به تلگرام
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: aiResponse,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false });
  }
};
