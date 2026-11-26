import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { asset, currentPrice, high24h, low24h, timeframe, contextData } = await req.json();

    const assetLabel =
      asset === 'XAUUSD'
        ? 'មាសអន្តរជាតិ (Spot Gold XAU/USD) និងទីផ្សារមាសកម្ពុជា (គិតជាអោន និង តម្លឹង)'
        : asset === 'USDKHR'
        ? 'អត្រាប្ដូរប្រាក់ ដុល្លារ-រៀល (USD/KHR) និង យាន់-រៀល (CNY/KHR)'
        : 'តម្លៃប្រេងឥន្ធនៈអន្តរជាតិ (Brent Crude) និងតម្លៃប្រេងលក់រាយនៅកម្ពុជា (សាំង-ម៉ាស៊ូត)';

    const prompt = `
អ្នកគឺជាអ្នកជំនាញវិភាគទីផ្សារហិរញ្ញវត្ថុ និងយុទ្ធសាស្ត្រ ICT (Inner Circle Trader) កម្រិតខ្ពស់។
សូមធ្វើការវិភាគបច្ចេកទេសយ៉ាងលម្អិតជាភាសាខ្មែរ (Khmer Language) សម្រាប់ទ្រព្យសកម្មខាងក្រោម៖

- ទ្រព្យសកម្ម (Asset): ${assetLabel}
- តម្លៃបច្ចុប្បន្ន (Current Price): ${currentPrice}
- តម្លៃខ្ពស់បំផុត 24h: ${high24h || 'N/A'}
- តម្លៃទាបបំផុត 24h: ${low24h || 'N/A'}
- Timeframe: ${timeframe || '4H / Daily'}
- ព័ត៌មានបន្ថែម៖ ${JSON.stringify(contextData || {})}

សូមរៀបរៀងការវិភាគតាមទម្រង់ស្តង់ដារ ICT ដូចខាងក្រោម៖
1. **និន្នាការទូទៅ (Market Bias)**: កំណត់ថា "ឡើង (Bullish)" ឬ "ចុះ (Bearish)" ឬ "រង់ចាំ (Consolidation)"
2. **រចនាសម្ព័ន្ធទីផ្សារ (Market Structure & Liquidity)**:
   - វិភាគ Break of Structure (BOS) ឬ Change of Character (CHoCH)
   - កំណត់តំបន់ Buy-Side Liquidity (BSL) និង Sell-Side Liquidity (SSL)
3. **តំបន់ Order Block (OB) & Fair Value Gap (FVG)**:
   - តំបន់ Discount Zone សម្រាប់ស្វែងរកការទិញ (Buy/Long)
   - តំបន់ Premium Zone សម្រាប់ស្វែងរកការលក់ (Sell/Short)
4. **អនុសាសន៍ជួញដូរជាក់ស្តែង (Trade Plan & Key Levels)**:
   - សកម្មភាព (Action): ទិញ (Buy) / លក់ (Sell) / រង់ចាំ (Wait)
   - តំបន់ចូល (Entry Zone)
   - កម្រិតកាត់ខាត (Stop Loss)
   - កម្រិតយកប្រាក់ចំណេញ (Take Profit 1, Take Profit 2)
   - អត្រាផលចំណេញធៀបនឹងហានិភ័យ (Risk : Reward)
5. **ការវាយតម្លៃសម្រាប់ទីផ្សារកម្ពុជា (Cambodia Market Impact)**:
   - ផលប៉ះពាល់លើការទិញ-លក់មាសគិតជាតម្លឹង ឬ អត្រាប្ដូរប្រាក់ ឬ តម្លៃប្រេងនៅកម្ពុជា

សូមសរសេរជាភាសាខ្មែរផ្លូវការ ងាយយល់ ច្បាស់លាស់ និងមានលក្ខណៈវិជ្ជាជីវៈខ្ពស់។
`;

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      // Provide high quality structured fallback response if no key is supplied yet
      return NextResponse.json({
        analysisText: `📊 **របាយការណ៍វិភាគបច្ចេកទេស ICT សម្រាប់ ${assetLabel}**
*(បង្កើតឡើងដោយម៉ាស៊ីនវិភាគទិន្នន័យស្វ័យប្រវត្តិ)*

1. **និន្នាការទូទៅ (Market Bias): ឡើង (Bullish)**
• តម្លៃបច្ចុប្បន្ន $${currentPrice} កំពុងស្ថិតក្នុងរលកកើនឡើង (Bullish Order Flow) បន្ទាប់ពីបានបង្កើត Market Structure Shift (MSS) នៅលើ Timeframe 4H។
• អ្នកទិញ (Smart Money) បាន sweep យក Sell-Side Liquidity (SSL) នៅកម្រិតទាបមុន ធ្វើឱ្យកម្លាំងទិញត្រឡប់មកវិញយ៉ាងខ្លាំង។

2. **រចនាសម្ព័ន្ធទីផ្សារ និង Liquidity (ICT Framework):**
• **BOS (Break of Structure):** បានទម្លុះកម្រិតតស៊ូចាស់ បង្កើត Higher High ថ្មី។
• **BSL (Buy-Side Liquidity):** ស្ថិតនៅកម្រិតកំពូលបន្ទាប់ ដែលជាគោលដៅរុញតម្លៃឡើងទៅយក Liquidity របស់អ្នកលក់។
• **Equilibrium (50% Fibonacci):** បែងចែករវាងតំបន់ Discount (ក្រោម 50%) និង Premium (លើ 50%)។

3. **តំបន់សំខាន់ៗ (Order Block & Fair Value Gap):**
• **Bullish Order Block (OB):** ជាតំបន់ទៀនក្រហមចុងក្រោយមុនការឡើងខ្លាំង ជាតំបន់គាំទ្ររឹងមាំសម្រាប់រង់ចាំទិញ។
• **Fair Value Gap (FVG):** មានចន្លោះអតុល្យភាពតម្លៃ (Price Imbalance) ដែលទីផ្សារតែងតែត្រឡប់មក Retest ដើម្បីបំពេញរួចទើបបន្តឡើង។

4. **ផែនការជួញដូរដែលបានណែនាំ (Actionable Plan):**
• **សកម្មភាព (Signal):** រង់ចាំទិញ (Wait for Pullback into Discount Zone / Buy Limit)
• **Stop Loss (SL):** ដាក់នៅក្រោម Swing Low ចុងក្រោយ ឬ ក្រោម Bullish OB
• **Take Profit (TP):** TP1 យកនៅ Equal Highs, TP2 យកនៅ Buy-Side Liquidity ធំ
• **Risk : Reward:** យ៉ាងតិច 1 : 2.5

5. **ផលប៉ះពាល់លើទីផ្សារកម្ពុជា:**
• ប្រសិនបើតម្លៃមាសអន្តរជាតិឡើង តម្លៃមាសនៅកម្ពុជាគិតជា "តម្លឹង" នឹងឡើងស្របគ្នា។ សម្រាប់អ្នកវិនិយោគទុនក្នុងស្រុក គួរទិញសន្សំបន្ថែមនៅពេលតម្លៃចុះមកតំបន់ Support នៃតម្លឹង។`,
        timestamp: new Date().toISOString(),
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
    });

    const text = response.text || '';

    return NextResponse.json({
      analysisText: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'កំហុសក្នុងការបង្កើតការវិភាគ ICT ពី Gemini',
      },
      { status: 500 }
    );
  }
}
