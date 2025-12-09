import { GoogleGenAI } from '@google/genai';

interface DiaryCorrection {
  corrected: string;
  explanations: string[];
  vocabIds?: string[];
  grammarPoints: string[];
}

/**
 * 使用 Google Gemini API
 */
export async function correctDiaryWithGemini(
  original: string,
  userLevel: string
): Promise<DiaryCorrection> {
  try {
    const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('缺少 Gemini API Key');
    }

    // 初始化 Gemini
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const prompt = `你是一位專業的日文老師,正在批改台灣學生的日記。
      學生目前的 JLPT 程度是 ${userLevel}。

      學生寫的日文:
      ${original}

      請用繁體中文給予說明和建議。回覆必須是純 JSON 格式,包含以下欄位:
      {
        "corrected": "修正後的日文",
        "explanations": ["繁體中文說明1", "繁體中文說明2", ...],
        "grammarPoints": ["繁體中文文法重點1", "繁體中文文法重點2", ...]
      }

      重要:
      1. explanations 和 grammarPoints 必須用繁體中文
      2. 請給予鼓勵且具體的建議
      3. 不要使用 Markdown 語法(如 **粗體**)，使用純文字
      4. 說明要清楚易懂，適合學習者閱讀`;

    // 使用 API
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error('Gemini 沒有回傳內容');
    }

    // 解析 JSON 回應
    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      // 如果解析失敗,嘗試提取 JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('無法解析 Gemini 回應');
      }
    }

    // 清理 Markdown 符號
    const cleanText = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');

    return {
      corrected: parsedResult.corrected || original,
      explanations: (parsedResult.explanations || []).map(cleanText),
      vocabIds: parsedResult.vocabIds || [],
      grammarPoints: (parsedResult.grammarPoints || []).map(cleanText),
    };
  } catch (error) {
    console.error('Gemini 批改失敗:', error);
    throw error;
  }
}
