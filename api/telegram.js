module.exports = async function (req, res) {
  const body = req.body;
  const fetch = (await import('node-fetch')).default;

  // ---------------------------------------------------------
  // بخش اول: مدیریت کلیک روی دکمه‌های شیشه‌ای
  // ---------------------------------------------------------
  if (body.callback_query) {
    const callbackData = body.callback_query.data;
    const chatId = body.callback_query.message.chat.id;
    const callbackId = body.callback_query.id;

    const buttonVoices = {
      "courses_info": "AwACAgQAAxkBAANJakwJ8Ghtwn1H7B2jtt71-rKen3sAAo0eAAL_gWFSqOFgmKDeSuI8BA",
      "contact_info": "AwACAgQAAxkBAANKakwJ8OP_cGMrH8VoB9Hsdxe6tKgAAo4eAAL_gWFS1mjxcszXDPs8BA"
    };

    if (buttonVoices[callbackData]) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendVoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: chatId, 
          voice: buttonVoices[callbackData] 
        })
      });
    }

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackId })
    });

    return res.status(200).json({ success: true });
  }

  // ---------------------------------------------------------
  // بخش دوم: مدیریت استارت و خوش‌آمدگویی
  // ---------------------------------------------------------
  const message = body.message;
  if (!message || !message.text) return res.status(200).send('OK');

  const userText = message.text.trim();
  const chatId = message.chat.id;

  const welcomeVoiceId = "AwACAgQAAxkBAANAakwHVA1iVuhbQqBiRmzY4G8d4fcAAkgkAALXy2BSwr3WPT-fBME8BA";

  if (userText === "/start" || userText === "سلام") {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendVoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        voice: welcomeVoiceId,
        caption: "به مدرسه هوش مصنوعی دکتر فورد خوش آمدید. 🎙\n\nلطفاً از منوی زیر انتخاب کنید یا سوال خود را بپرسید:",
        reply_markup: {
          inline_keyboard: [
            [{ text: "معرفی دوره‌ها 📚", callback_data: "courses_info" }],
            [{ text: "ارتباط با مدیریت 📞", callback_data: "contact_info" }]
          ]
        }
      })
    });
    return res.status(200).json({ success: true });
  }

  // ---------------------------------------------------------
  // بخش سوم: تشخیص ارسال شماره تماس
  // ---------------------------------------------------------
  // این الگو شماره موبایل‌های ایرانی (با حروف انگلیسی یا فارسی) را تشخیص می‌دهد
  const phoneRegex = /(09|\+989|۹۸۹|۰۹)[0-9۰-۹\s\-]{8,11}/;
  
  if (phoneRegex.test(userText)) {
    const successMessage = "اطلاعات شما با موفقیت در سیستم پذیرش ثبت شد. از آشنایی با شما بسیار خوشحالیم! 🌿\n\nتیم مدیریت به‌زودی برای هماهنگی وقت مشاوره با شما تماس خواهد گرفت. به دنیای پیشرو مدرسه دکتر فورد خوش آمدید.";
    
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: successMessage })
    });
    return res.status(200).json({ success: true });
  }

  // ---------------------------------------------------------
  // بخش چهارم: هوش مصنوعی برای پاسخ به سایر سوالات
  // ---------------------------------------------------------
  const knowledgeBase = `مدیریت مجموعه: شیوا عاشوری. شعار: پیوند تفکر استراتژیک و تکنولوژی. دوره‌ها: ۱. فیلم‌سازی AI ۲. طراحی صنعتی ۳. مهندسی ایجنت‌های هوشمند. ثبت‌نام: ارسال نام و شماره تماس جهت مشاوره. لحن: سرد، مینیمال، حرفه‌ای و مدیریتی.`;

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `شما دستیار ارشد مدرسه دکتر فورد هستید. اطلاعات شما: ${knowledgeBase}. سوال کاربر: ${userText}` }] }]
      })
    });

    const geminiData = await geminiRes.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "سیستم در حال پردازش است. لطفاً لحظاتی دیگر تلاش کنید.";

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
