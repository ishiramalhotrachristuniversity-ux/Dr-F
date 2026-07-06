module.exports = async function (req, res) {
  const { message } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  const fetch = (await import('node-fetch')).default;
  const userText = message.text.trim();
  const chatId = message.chat.id;

  const knowledgeBase = `مدیریت مجموعه: شیوا عاشوری. شعار: پیوند تفکر استراتژیک و تکنولوژی. دوره‌ها: فیلم‌سازی AI، طراحی صنعتی، مهندسی ایجنت‌های هوشمند. ثبت‌نام: ارسال نام و شماره تماس.`;

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `شما دستیار شیوا عاشوری هستید. اطلاعات: ${knowledgeBase}. سوال: ${userText}` }] }]
      })
    });

    const geminiData = await geminiRes.json();
    
    // دریافت پاسخ یا متن خطا
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(geminiData);

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: aiText })
    });
  } catch (error) {
    console.error("Error:", error);
  }

  return res.status(200).json({ success: true });
};
