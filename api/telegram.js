// api/telegram.js

module.exports = async function (req, res) {
  const { message } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  const userText = message.text.trim();
  const chatId = message.chat.id;
  const fetch = (await import('node-fetch')).default;

  // لیست پاسخ‌های سریع و سازمانی
  const quickAnswers = {
    "/start": "به مدرسه هوش مصنوعی دکتر فورد خوش آمدید. بستری برای پیوند میان تفکر استراتژیک و تکنولوژی‌های نوظهور. چگونه می‌توانیم در مسیر حرفه‌ای شما را همراهی کنیم؟",
    "درباره مدرسه": "مدرسه دکتر فورد؛ کانون تخصصیِ پژوهش و آموزش در حوزه‌های فیلم‌سازیِ AI، طراحی صنعتی و معماریِ سیستم‌های هوشمند (Agents). رویکرد ما متمرکز بر خروجی‌های استاندارد و پیشرو است.",
    "دوره ها": "دپارتمان‌های آموزشی ما شامل: ۱. فیلم‌سازی هوشمند ۲. طراحی صنعتی ۳. مهندسی ایجنت‌ها. برای دسترسی به جزئیاتِ سرفصلِ هر دپارتمان، نام آن را ارسال کنید.",
    "ثبت نام": "برای بررسیِ شرایطِ پذیرش و دریافت وقتِ مشاوره اختصاصی، «نام و شماره تماس» خود را ارسال فرمایید تا واحد پذیرش در اولین فرصت با شما ارتباط برقرار کند.",
    "تماس": "تیم مدیریتِ مجموعه آماده‌ی بررسیِ پیشنهادات و پاسخگویی به پرسش‌های تخصصی شماست. لطفاً پیام خود را ثبت کنید."
  };

  // بررسی هوشمند پاسخ‌ها
  if (quickAnswers[userText]) {
    await sendMsg(chatId, quickAnswers[userText], fetch);
  } else {
    // در صورتی که پرسش خارج از لیست بود، جمینای با لحن سازمانی پاسخ می‌دهد
    const aiResponse = await getAiResponse(userText, fetch);
    await sendMsg(chatId, aiResponse, fetch);
  }

  return res.status(200).json({ success: true });
};

// توابع کمکی
async function sendMsg(chatId, text, fetch) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

async function getAiResponse(text, fetch) {
  const systemInstruction = "شما مشاور حرفه‌ای مدرسه هوش مصنوعی دکتر فورد هستید. لحن شما سرد، مینیمال، مدیریتی و بسیار حرفه‌ای است. از معرفیِ فردی خودداری کنید و فقط با هویت سازمانی پاسخ دهید.";
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: systemInstruction + "\n\n" + text }] }] })
  });
  
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}
