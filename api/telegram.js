module.exports = async function (req, res) {
  const { message } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  const fetch = (await import('node-fetch')).default;
  const userText = message.text.trim();
  const chatId = message.chat.id;

  // لیست پاسخ‌های حرفه‌ای (از پیش ساخته)
  const responses = {
    "/start": "به مدرسه هوش مصنوعی دکتر فورد خوش آمدید. بستری برای پیوند میان تفکر استراتژیک و تکنولوژی‌های نوظهور. چگونه می‌توانیم در مسیر حرفه‌ای شما را همراهی کنیم؟",
    "درباره مدرسه": "مدرسه دکتر فورد؛ کانون تخصصیِ پژوهش و آموزش در حوزه‌های فیلم‌سازیِ AI، طراحی صنعتی و معماریِ سیستم‌های هوشمند (Agents). رویکرد ما متمرکز بر خروجی‌های استاندارد و پیشرو است.",
    "دوره ها": "دپارتمان‌های آموزشی ما شامل: ۱. فیلم‌سازی هوشمند ۲. طراحی صنعتی ۳. مهندسی ایجنت‌ها. برای دسترسی به جزئیاتِ سرفصلِ هر دپارتمان، نام آن را ارسال کنید.",
    "ثبت نام": "برای بررسیِ شرایطِ پذیرش و دریافت وقتِ مشاوره اختصاصی، «نام و شماره تماس» خود را ارسال فرمایید تا واحد پذیرش در اولین فرصت با شما ارتباط برقرار کند.",
    "تماس": "تیم مدیریتِ مجموعه آماده‌ی بررسیِ پیشنهادات و پاسخگویی به پرسش‌های تخصصی شماست. لطفاً پیام خود را ثبت کنید."
  };

  // تعیین پاسخ
  let replyText = responses[userText] || "پیام شما دریافت شد. تیم مدیریت مدرسه دکتر فورد در اسرع وقت بررسی و پاسخگویی خواهد کرد.";

  // ارسال پاسخ نهایی
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: replyText })
  });

  return res.status(200).json({ success: true });
};
