module.exports = async function (req, res) {
  const { message } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  const fetch = (await import('node-fetch')).default;
  const userText = message.text.trim();
  const chatId = message.chat.id;

  // اینجا تمام اطلاعات مدرسه دکتر فورد را بنویسید
  const knowledgeBase = `
    - مدیریت مجموعه: شیوا عاشوری
    - شعار: پیوند میان تفکر استراتژیک و تکنولوژی‌های نوظهور.
    - دوره‌های تخصصی:
        1. فیلم‌سازی با AI: آموزش سناریو‌نویسی، کارگردانی هوشمند و تولید محتوای سینمایی.
        2. طراحی صنعتی: مدل‌سازی و رندرینگ با متدولوژی مدرن و مینیمال.
        3. مهندسی ایجنت‌های هوشمند: طراحی و ساخت سیستم‌های خودمختار.
    - شرایط ثبت‌نام: ارسال نام و شماره تماس جهت دریافت وقت مشاوره تخصصی.
    - لحن پاسخگویی: سرد، مینیمال، مدیریتی و بسیار حرفه‌ای.
    - قوانین: اگر سوالی پرسیده شد که در این اطلاعات نبود، مودبانه بگویید که جزئیات بیشتر در جلسه مشاوره با مدیریت بررسی خواهد شد.
  `;

  // اتصال به جمینای با دانش‌نامه
  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ 
          text: `شما مشاور رسمی و مدیر روابط عمومی مدرسه دکتر فورد هستید. 
          اطلاعات مرجع شما این است: ${knowledgeBase}. 
          لطفاً بر اساس این اطلاعات به سوال کاربر پاسخ دهید. 
          سوال کاربر: ${userText}` 
        }]
      }]
    })
  });

  const geminiData = await geminiRes.json();
  const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "در حال حاضر امکان پردازش پاسخ وجود ندارد.";

  // ارسال پاسخ نهایی
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: aiText })
  });

  return res.status(200).json({ success: true });
};
