import { GoogleGenAI } from '@google/genai';
import { Word } from '../types';

interface DiaryCorrection {
  corrected: string;
  explanations: string[];
  vocabIds?: string[];
  grammarPoints: string[];
  suggestedWords?: Word[]; // 新增建議單字
}

/**
 * 使用 Google Gemini API
 */
export async function correctDiaryWithGemini(
  original: string,
  userLevel: string,
  language: 'zh' | 'en' = 'zh'
): Promise<DiaryCorrection> {
  try {
    const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('缺少 Gemini API Key');
    }

    // 初始化 Gemini
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // 根據語言生成不同的 prompt
    const prompts = {
      zh: `你是一位專業的日文老師,正在批改台灣學生的日記。
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
        4. 說明要清楚易懂，適合學習者閱讀`,
      en: `You are a professional Japanese teacher correcting a student's diary.
        The student's current JLPT level is ${userLevel}.

        Student's Japanese writing:
        ${original}

        Please provide explanations and suggestions in English. The response must be in pure JSON format with the following fields:
        {
          "corrected": "Corrected Japanese text",
          "explanations": ["English explanation 1", "English explanation 2", ...],
          "grammarPoints": ["English grammar point 1", "English grammar point 2", ...]
        }

        Important:
        1. explanations and grammarPoints must be in English
        2. Give encouraging and specific suggestions
        3. Do not use Markdown syntax (like **bold**), use plain text
        4. Explanations should be clear and easy to understand for learners`
    };

    const prompt = prompts[language];

    // 使用 API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

/**
 * 從日記中提取學習單字
 */
export async function extractWordsFromDiary(
  diaryText: string,
  userLevel: string,
  language: 'zh' | 'en' = 'zh'
): Promise<Word[]> {
  try {
    const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('缺少 Gemini API Key');
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // 根據語言生成不同的 prompt
    const prompts = {
      zh: `你是一位專業的日文老師,學生目前的 JLPT 程度是 ${userLevel}。
        從以下日記中提取 3-5 個適合學生程度的重要單字,用於加入單字庫學習:
        ${diaryText}
        請回傳 JSON 格式的單字陣列,每個單字包含:
        {
          "words": [
            {
              "kanji": "單字漢字",
              "kana": "假名讀音",
              "meaning": "繁體中文意思",
              "exampleJa": "日文例句(使用這個單字)",
              "exampleTranslation": "例句的繁體中文翻譯",
              "level": "${userLevel}"
            }
          ]
        }

        重要:
        1. 只提取日記中實際出現的單字
        2. 選擇對學習最有幫助的單字
        3. meaning 和 exampleTranslation 必須使用繁體中文
        4. 例句要簡單易懂
        5. 不要使用 Markdown 語法`,
      en: `You are a professional Japanese teacher. The student's current JLPT level is ${userLevel}.
        Extract 3-5 important words suitable for the student's level from the following diary for vocabulary learning:
        ${diaryText}
        Return a JSON array of words, each containing:
        {
          "words": [
            {
              "kanji": "Word in Kanji",
              "kana": "Kana reading",
              "meaning": "Meaning in English",
              "exampleJa": "Japanese example sentence (using this word)",
              "exampleTranslation": "English translation of the example sentence",
              "level": "${userLevel}"
            }
          ]
        }

        Important:
        1. Only extract words that actually appear in the diary
        2. Choose words most helpful for learning
        3. meaning and exampleTranslation must be in English
        4. Example sentences should be simple and easy to understand
        5. Do not use Markdown syntax`
    };

    const prompt = prompts[language];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      return [];
    }

    // 解析 JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        return [];
      }
    }

    // 轉換為 Word 格式
    const words: Word[] = (parsedResult.words || []).map((w: any, index: number) => ({
      id: `diary-word-${Date.now()}-${index}`,
      level: w.level || userLevel,
      kanji: w.kanji || '',
      kana: w.kana || '',
      meaning: w.meaning || '',
      exampleJa: w.exampleJa,
      exampleTranslation: w.exampleTranslation,
      familiarity: 0,
      flagged: false,
    }));

    return words;
  } catch (error) {
    console.error('提取單字失敗:', error);
    return [];
  }
}
