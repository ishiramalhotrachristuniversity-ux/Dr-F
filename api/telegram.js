module.exports = async function (req, res) {
  const body = req.body;
  
  if (!body) return res.status(200).send('OK');
  
  const fetch = (await import('node-fetch')).default;

  // ---------------------------------------------------------
  // بخش اول: دکمه‌های شیشه‌ای و ویس
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
        body: JSON.stringify({ chat_id: chatId, voice: buttonVoices[callbackData] })
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
  // بخش دوم: استارت و خوش‌آمدگویی
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
        caption: "به مجتمع جامع آموزش و مهارت‌افزایی هوش مصنوعی دکتر فورد خوش آمدید. 🎙\n\nلطفاً از منوی زیر انتخاب کنید یا سوال خود را بپرسید:",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "معرفی دوره‌ها 📚", callback_data: "courses_info" },
              { text: "ارتباط با مدیریت 📞", callback_data: "contact_info" }
            ]
          ]
        }
      })
    });
    return res.status(200).json({ success: true });
  }

  // ---------------------------------------------------------
  // بخش سوم: سیستم پذیرش هوشمند (گرفتن شماره)
  // ---------------------------------------------------------
  const phoneRegex = /(09|\+989|۹۸۹|۰۹)[0-9۰-۹\s\-]{8,11}/;
  
  if (phoneRegex.test(userText)) {
    const successMessage = "اطلاعات شما با موفقیت در سیستم پذیرش ثبت شد. از آشنایی با شما بسیار خوشحالیم! 🌿\n\nتیم مدیریت به‌زودی برای هماهنگی وقت مشاوره با شما تماس خواهد گرفت. به دنیای پیشرو مدرسه دکتر فورد خوش آمدید.";
    
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: successMessage })
    });

    const adminGroupId = "-1004322710422"; 
    const username = message.from.username ? `@${message.from.username}` : "بدون آیدی";
    const firstName = message.from.first_name || "";
    const lastName = message.from.last_name || "";
    
    const adminNotification = `🔔 گزارش لید جدید - دکتر فورد\n\n👤 نام اکانت: ${firstName} ${lastName}\n🔗 آیدی فرستنده: ${username}\n💬 متن پیام:\n${userText}`;
    
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminGroupId, text: adminNotification })
    });

    return res.status(200).json({ success: true });
  }

  // ---------------------------------------------------------
  // بخش چهارم: سیستم پاسخگویی خودکار و سریع (جایگزین هوش مصنوعی)
  // ---------------------------------------------------------
  let replyText = "";

  // بررسی کلمات کلیدی در پیام کاربر
  if (userText.includes("هزینه") || userText.includes("قیمت") || userText.includes("ثبت نام") || userText.includes("شهریه") || userText.includes("چقدر")) {
    replyText = "برای اینکه بتونیم دقیق‌ترین مشاوره رو درباره دوره‌ها بهتون بدیم، لطفاً نام کامل و شماره تماستون رو همینجا بفرستید تا تیم پذیرش در اولین فرصت با شما تماس بگیرند. 🌿";
  } 
  else if (userText.includes("فاز ۱") || userText.includes("فاز 1") || userText.includes("فاز یک") || userText.includes("مبتدی") || userText.includes("پایه")) {
    replyText = "📚 **فاز ۱ (آکادمی مهارتی پایه):**\nاین فاز کاملاً بدون نیاز به کدنویسی (No-Code) است و شامل ۴ بخش تخصصی می‌شود:\n\n۱. مهندسی پرامپت\n۲. تولید محتوای ویدئویی (HeyGen, ElevenLabs)\n۳. پژوهش آکادمیک\n۴. ساخت ایجنت‌های هوشمند.\n\nجهت دریافت مشاوره رایگان، لطفاً شماره تماس خود را ارسال کنید. 🌿";
  } 
  else if (userText.includes("فاز ۲") || userText.includes("فاز 2") || userText.includes("فاز دو") || userText.includes("بوت کمپ") || userText.includes("پایتون")) {
    replyText = "💻 **فاز ۲ (بوت‌کمپ تخصصی):**\nاین دوره ویژه دانشجویان و مهندسان است و روی برنامه‌نویسی پایتون، سیستم‌های چندعاملی، معماری RAG و زیرساخت‌های ابری تمرکز دارد تا شما را سریعاً برای بازار کار آماده کند.\n\nبرای تعیین سطح، نام و شماره تماس خود را ارسال کنید. 🌿";
  } 
  else if (userText.includes("فاز ۳") || userText.includes("فاز 3") || userText.includes("فاز سه") || userText.includes("استارتاپ") || userText.includes("تجاری")) {
    replyText = "🚀 **فاز ۳ (مرکز نوآوری):**\nمرکز نوآوری ما یک شتابدهنده تخصصی است. ما به تیم‌ها کمک می‌کنیم تا ایده‌هایشان را تجاری‌سازی کنند، محصول (MVP) بسازند و سرمایه خطرپذیر جذب کنند.\n\nجهت ارتباط با مرکز نوآوری، شماره تماس خود را قرار دهید. 🌿";
  } 
  else {
    // پیام پیش‌فرض اگر کاربر چیز دیگری تایپ کرد
    replyText = "پیام شما دریافت شد. 🌿\n\nبرای راهنمایی بهتر و دریافت مشاوره تخصصی، لطفاً نام و شماره تماس خود را ارسال کنید تا تیم مدیریت دکتر فورد مستقیماً با شما تماس بگیرند.";
  }

  // ارسال پیام آماده شده به کاربر
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: replyText, parse_mode: "Markdown" })
  });

  return res.status(200).json({ success: true });
};
