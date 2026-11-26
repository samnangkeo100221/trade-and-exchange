import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    serverConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      botToken: clientBotToken,
      chatId: clientChatId,
      message,
      parseMode = 'HTML',
    } = body;

    const resolvedToken = (clientBotToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const resolvedChatId = (clientChatId || process.env.TELEGRAM_CHAT_ID || '').trim();

    if (!resolvedToken || !resolvedChatId || !message) {
      return NextResponse.json(
        { error: 'សូមបញ្ចូល Bot Token, Chat ID និង អត្ថបទសារ (Missing required parameters)' },
        { status: 400 }
      );
    }

    if (typeof message !== 'string' || message.length > 4096) {
      return NextResponse.json(
        { error: 'អត្ថបទសារមិនត្រឹមត្រូវ ឬវែងលើស ៤០៩៦ តួអក្សរ' },
        { status: 400 }
      );
    }

    // Call Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${encodeURIComponent(resolvedToken)}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: resolvedChatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return NextResponse.json(
        {
          error: data.description || 'បរាជ័យក្នុងការផ្ញើសារទៅកាន់ Telegram',
          details: data,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data.result?.message_id,
      chat: data.result?.chat?.title || data.result?.chat?.first_name || resolvedChatId,
    });
  } catch (error: any) {
    console.error('Telegram API Error:', error);
    return NextResponse.json(
      { error: error.message || 'កំហុសបច្ចេកទេសក្នុងការតភ្ជាប់ទៅ Telegram' },
      { status: 500 }
    );
  }
}
