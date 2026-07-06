module.exports = async function (req, res) {
  const { message } = req.body;
  if (!message) return res.status(200).send('OK');

  // فقط جوابِ ثابت برمی‌گرداند
  const fetch = (await import('node-fetch')).default;
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: message.chat.id, text: "سلام! سرور من فعال است." })
  });

  return res.status(200).json({ success: true });
};
