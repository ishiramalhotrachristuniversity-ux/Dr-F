module.exports = async function (req, res) {
  const { message } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  const fetch = (await import('node-fetch')).default;
  const userText = message.text.trim();
  const chatId = message.chat.id;

  // کد ویس شما
  const welcomeVoiceId = "AwACAgQAAxkBAANAakwHVA1iVuhbQqBiRmzY4G8d4fcAAkgkAALXy2BSwr3WPT-fBME8BA";

  // ۱. بررسی ورود کاربر (ارسال ویس)
  if (userText === "/start" || userText === "سلام") {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendVoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        voice: welcomeVoiceId,
        caption: "به مدرسه هوش مصنوعی دکتر فورد خوش آمدید. 🎙\n\nبرای دریافت مشاوره، سوال خود را بپرسید."
      })
    });
    return res.status(200).json({ success: true });
  }

  // ۲. پاسخگویی هوشمند به سایر سوالات کاربر با دیتابیس مدرسه
  const knowledgeBase = `مدیریت مجموعه: شیوا عاشوری. شعار: پیوند تفکر استراتژیک و تکنولوژی. دوره‌ها: ۱. فیلم‌سازی AI ۲. طراحی صنعتی ۳. مهندسی ایجنت‌های هوشمند. ثبت‌نام: ارسال نام و شماره تماس جهت مشاوره. لحن: سرد، حرفه‌ای و مدیریتی.`;

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `شما دستیار ارشد مدرسه دکتر فورد هستید. اطلاعات شما: ${knowledgeBase}. سوال کاربر: ${userText}` }] }]
      })
    });

    const geminiData = await geminiRes.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "در حال حاضر سیستم در حال بروزرسانی است. لطفاً دقایقی دیگر تلاش کنید.";

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
