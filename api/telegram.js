module.exports = async function (req, res) {
  const { message } = req.body;
  if (!message) return res.status(200).send('OK');

  const fetch = (await import('node-fetch')).default;
  const chatId = message.chat.id;

  // اگر کاربر ویس فرستاد، آیدی دقیق ویس را برایش بفرست
  if (message.voice) {
    const voiceId = message.voice.file_id;
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `کد ویس شما با موفقیت استخراج شد. آن را دقیقاً کپی کنید:\n\n${voiceId}`
      })
    });
    return res.status(200).json({ success: true });
  }

  // اگر کاربر متن فرستاد، راهنمایی‌اش کن
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: "لطفاً همین الان یک ویس کوتاه در اینجا ضبط و ارسال کنید تا کد آن را به شما بدهم."
    })
  });

  return res.status(200).json({ success: true });
};
