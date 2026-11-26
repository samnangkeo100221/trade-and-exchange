import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botToken, chatId, message, parseMode = 'HTML' } = body;

    if (!botToken || !chatId || !message) {
      return NextResponse.json(
        { error: 'សូមបញ្ចូល Bot Token, Chat ID និង អត្ថបទសារ (Missing required parameters)' },
        { status: 400 }
      );
    }

    // Call Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
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
      chat: data.result?.chat?.title || data.result?.chat?.first_name || chatId,
    });
  } catch (error: any) {
    console.error('Telegram API Error:', error);
    return NextResponse.json(
      { error: error.message || 'កំហុសបច្ចេកទេសក្នុងការតភ្ជាប់ទៅ Telegram' },
      { status: 500 }
    );
  }
}
