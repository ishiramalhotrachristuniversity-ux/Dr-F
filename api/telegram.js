module.exports = async function (req, res) {
  const body = req.body;
  
  // جلوگیری از خطاهای مربوط به درخواست‌های خالی
  if (!body) return res.status(200).send('OK');
  
  const fetch = (await import('node-fetch')).default;

  // ---------------------------------------------------------
  // بخش اول: مدیریت کلیک روی دکمه‌های شیشه‌ای و ارسال ویس
  // ---------------------------------------------------------
  if (body.callback_query) {
    const callbackData = body.callback_query.data;
    const chatId = body.callback_query.message.chat.id;
    const callbackId = body.callback_query.id;

    // دیتابیس ویس‌های اختصاصی شما
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

    // برداشتن حالت لودینگ از روی دکمه
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

  // ویس خوش‌آمدگویی اصلی
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
  // بخش سوم: سیستم پذیرش هوشمند (تشخیص شماره و ارسال به گروه مدیریت)
  // ---------------------------------------------------------
  const phoneRegex = /(09|\+989|۹۸۹|۰۹)[0-9۰-۹\s\-]{8,11}/;
  
  if (phoneRegex.test(userText)) {
    // ۱. ارسال پیام تایید به کاربر
    const successMessage = "اطلاعات شما با موفقیت در سیستم پذیرش ثبت شد. از آشنایی با شما بسیار خوشحالیم! 🌿\n\nتیم مدیریت به‌زودی برای هماهنگی وقت مشاوره با شما تماس خواهد گرفت. به دنیای پیشرو مدرسه دکتر فورد خوش آمدید.";
    
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: successMessage })
    });

    // ۲. ارسال گزارش به گروه مدیریت شما
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
  // بخش چهارم: هوش مصنوعی جمینای (با روش اتصال تضمینی ۱۰۰٪)
  // ---------------------------------------------------------
  const knowledgeBase = `شما دستیار ارشد و مشاور مهربانِ "مجتمع جامع آموزش و مهارت‌افزایی هوش مصنوعی دکتر فورد" هستید.
مدیریت مجموعه: سرکار خانم شیوا عاشوری.
شعار: پیوند تفکر استراتژیک و تکنولوژی در یک اکوسیستم پیشرو.
لحن شما: دوستانه، صمیمی، گرم، محترمانه و بسیار راهگشا. شما باید حس یک مشاور دلسوز و باکلاس را به مخاطب منتقل کنید که مشتاقانه به او کمک می‌کند مسیر رشدش را پیدا کند. (اما از شوخی‌های بی‌جا پرهیز کنید).

ساختار مجتمع دارای ۳ فاز اصلی است:
فاز ۱ (آکادمی مهارتی پایه و هنرستان): تمرکز بر یادگیری ابزارمحور و بدون کد (No-Code). شامل ۴ ماژول تخصصی: مهندسی پرامپت، تولید محتوای ویدئویی (ElevenLabs, HeyGen)، پژوهش آکادمیک، و ساخت ایجنت بدون کد (Dify).
فاز ۲ (مجتمع آموزش عالی و بوت‌کمپ): ویژه دانشجویان و مهندسان. تمرکز بر برنامه‌نویسی پایتون، توسعه سیستم‌های چندعاملی (LangChain)، معماری RAG، و زیرساخت‌های ابری.
فاز ۳ (مرکز نوآوری و استودیو استارتاپی): شتابدهنده تخصصی برای تجاری‌سازی ایده‌ها، جذب سرمایه خطرپذیر (VC) و پروژه‌های تحقیق و توسعه (R&D).

قوانین مهم پاسخگویی:
- همیشه با روی خوش و انرژی مثبت پاسخ دهید.
- اگر کاربر درباره ثبت‌نام، هزینه دوره‌ها یا دریافت مشاوره پرسید، به هیچ وجه عدد یا قیمتی ندهید؛ فقط با مهربانی بگویید: "برای اینکه بتونیم دقیق‌ترین مشاوره رو بهتون بدیم، لطفاً نام کامل و شماره تماستون رو همینجا بفرستید تا تیم پذیرش در اولین فرصت با شما تماس بگیرند. 🌿"
- به سوالات تخصصی درباره سرفصل‌ها فقط بر اساس اطلاعات بالا، دقیق و با زبانی ساده پاسخ دهید.`;

  // ترکیب امن دستورات با سوال کاربر
  const safePrompt = `${knowledgeBase}\n\nسوال کاربر:\n${userText}`;

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: safePrompt }] }]
      })
    });

    const geminiData = await geminiRes.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "سیستم در حال به‌روزرسانی است. لطفاً لحظاتی دیگر پیام دهید.";

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
