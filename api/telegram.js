module.exports = async function (req, res) {
  if (req.method !== 'POST') return res.status(200).send('Bot is active');

  const { message } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  const fetch = (await import('node-fetch')).default;
  
  // درخواست به جمینای
  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: "شما مشاور مدرسه هوش مصنوعی دکتر فورد هستید. پاسخ‌های حرفه‌ای و کوتاه بدهید: " + message.text }] }] 
    })
  });

  const geminiData = await geminiRes.json();
  const aiText = geminiData.candidates[0].content.parts[0].text;

  // ارسال پاسخ به تلگرام
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: message.chat.id, text: aiText })
  });

  return res.status(200).json({ success: true });
};
