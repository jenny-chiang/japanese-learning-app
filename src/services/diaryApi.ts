import { GoogleGenAI } from '@google/genai';
import { Word, KeyWord, AdvancedWord, GrammarPoint } from '../types';

interface DiaryCorrection {
  corrected: string;
  chineseSummary: string;
  explanations: string[];
  vocabIds?: string[];
  keyWords: KeyWord[];
  grammarPoints: GrammarPoint[];
  advancedWords: AdvancedWord[];
  advancedGrammar: GrammarPoint[];
  upgradedVersion: string;
  suggestedWords?: Word[];
}

/**
 * 獲取下一個 JLPT 級別
 */
function getNextLevel(currentLevel: string): string {
  const levels: { [key: string]: string } = {
    'N5': 'N4',
    'N4': 'N3',
    'N3': 'N2',
    'N2': 'N1',
    'N1': 'N1' // N1 已經是最高級
  };
  return levels[currentLevel] || 'N3';
}

/**
 * 使用 Google Gemini API
 */
export async function correctDiaryWithGemini(
  original: string,
  userLevel: string,
  language: 'zh' | 'en' = 'zh',
  userApiKey?: string
): Promise<DiaryCorrection> {
  try {
    // 優先使用用戶的 API Key，否則使用環境變數中的
    const GEMINI_API_KEY = userApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('請先設定 Gemini API Key。\n\n您可以在「設定」頁面輸入自己的 API Key。');
    }

    // 初始化 Gemini
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // 根據語言生成不同的 prompt
    const nextLevel = getNextLevel(userLevel);
    const prompts = {
      zh: `你是一位專業的日文老師，正在批改台灣學生的日記。
        學生目前的 JLPT 程度是 ${userLevel}。

        學生寫的日文：
        ${original}

        批改規則：
        1. 錯誤檢查：只指出「真正錯誤」或「不自然到會造成誤解」的地方。小語感建議要說明「不是錯，只是更自然」。
        2. 中文重述：用繁體中文重述一遍日記內容，確認意思沒有跑掉。
        3. 單字／文法整理：列出日記裡的關鍵單字和使用到的重要文法或句型。
        4. 進階單字：列出 2-5 個比學生目前等級高一級（${userLevel} → ${nextLevel}）的單字，最好和當天情境有關。
        5. 進階文法：整理 1-3 個比學生目前等級高一級的文法，說明意思與用法並附例句。
        6. ${nextLevel}升級版：改寫一個使用更進階詞彙和表現方式的版本。

        請用繁體中文給予說明。回覆必須是純 JSON 格式，包含以下欄位：
        {
          "corrected": "修正後的日文（只修正真正的錯誤）",
          "chineseSummary": "用繁體中文重述日記內容",
          "explanations": [
            "繁體中文說明1（指出錯誤或給予語感建議）",
            "繁體中文說明2"
          ],
          "keyWords": [
            {"word": "單字", "meaning": "繁體中文意思"}
          ],
          "grammarPoints": [
            {
              "pattern": "文法句型",
              "meaning": "繁體中文意思",
              "example": "日文例句",
              "exampleTranslation": "繁體中文翻譯"
            }
          ],
          "advancedWords": [
            {
              "word": "進階單字",
              "level": "${nextLevel}",
              "meaning": "繁體中文意思",
              "example": "日文例句",
              "exampleTranslation": "繁體中文翻譯"
            }
          ],
          "advancedGrammar": [
            {
              "pattern": "進階文法句型",
              "meaning": "繁體中文意思與用法說明",
              "example": "日文例句",
              "exampleTranslation": "繁體中文翻譯"
            }
          ],
          "upgradedVersion": "使用 ${nextLevel} 程度改寫的版本"
        }

        重要：
        1. 所有中文必須使用繁體中文
        2. 請給予鼓勵且具體的建議
        3. 不要使用 Markdown 語法（如 **粗體**），使用純文字
        4. 說明要清楚易懂，適合學習者閱讀`,
      en: `You are a professional Japanese teacher correcting a student's diary.
        The student's current JLPT level is ${userLevel}.

        Student's Japanese writing:
        ${original}

        Correction Rules:
        1. Error Check: Only point out "real errors" or "unnatural expressions that cause misunderstanding". For minor stylistic suggestions, clarify "not wrong, just more natural".
        2. Chinese Summary: Restate the diary content in English to confirm the meaning is accurate.
        3. Vocabulary/Grammar Summary: List key vocabulary and important grammar patterns used in the diary.
        4. Advanced Vocabulary: List 2-5 words one level higher (${userLevel} → ${nextLevel}) related to the context.
        5. Advanced Grammar: Organize 1-3 grammar patterns one level higher with explanations and examples.
        6. ${nextLevel} Upgraded Version: Rewrite using more advanced vocabulary and expressions.

        Response must be in pure JSON format with the following fields:
        {
          "corrected": "Corrected Japanese text (only fix real errors)",
          "chineseSummary": "English restatement of the diary content",
          "explanations": [
            "English explanation 1 (point out errors or give stylistic suggestions)",
            "English explanation 2"
          ],
          "keyWords": [
            {"word": "word", "meaning": "English meaning"}
          ],
          "grammarPoints": [
            {
              "pattern": "grammar pattern",
              "meaning": "English meaning",
              "example": "Japanese example",
              "exampleTranslation": "English translation"
            }
          ],
          "advancedWords": [
            {
              "word": "advanced word",
              "level": "${nextLevel}",
              "meaning": "English meaning",
              "example": "Japanese example",
              "exampleTranslation": "English translation"
            }
          ],
          "advancedGrammar": [
            {
              "pattern": "advanced grammar pattern",
              "meaning": "English meaning and usage explanation",
              "example": "Japanese example",
              "exampleTranslation": "English translation"
            }
          ],
          "upgradedVersion": "Rewritten version using ${nextLevel} level"
        }

        Important:
        1. All explanations must be in English
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
      chineseSummary: parsedResult.chineseSummary || '',
      explanations: (parsedResult.explanations || []).map(cleanText),
      vocabIds: parsedResult.vocabIds || [],
      keyWords: parsedResult.keyWords || [],
      grammarPoints: parsedResult.grammarPoints || [],
      advancedWords: parsedResult.advancedWords || [],
      advancedGrammar: parsedResult.advancedGrammar || [],
      upgradedVersion: parsedResult.upgradedVersion || '',
    };
  } catch (error) {
    console.error('Gemini 批改失敗:', error);
    throw error;
  }
}

/**
 * 從日記中提取學習單字（包含當前級別和進階單字）
 */
export async function extractWordsFromDiary(
  diaryText: string,
  userLevel: string,
  language: 'zh' | 'en' = 'zh',
  userApiKey?: string
): Promise<Word[]> {
  try {
    // 優先使用用戶的 API Key，否則使用環境變數中的
    const GEMINI_API_KEY = userApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('請先設定 Gemini API Key');
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const nextLevel = getNextLevel(userLevel);

    // 根據語言生成不同的 prompt
    const prompts = {
      zh: `你是一位專業的日文老師，學生目前的 JLPT 程度是 ${userLevel}。
        從以下日記中提取單字用於加入單字庫學習：
        ${diaryText}

        請提取兩類單字：
        1. 當前級別（${userLevel}）：3-5 個適合學生目前程度的重要單字
        2. 進階級別（${nextLevel}）：2-3 個比學生程度高一級的單字，幫助挑戰更高水平

        請回傳 JSON 格式的單字陣列：
        {
          "words": [
            {
              "kanji": "單字漢字",
              "kana": "假名讀音",
              "meaning": "繁體中文意思",
              "exampleJa": "日文例句（使用這個單字）",
              "exampleTranslation": "例句的繁體中文翻譯",
              "level": "${userLevel} 或 ${nextLevel}"
            }
          ]
        }

        重要：
        1. 優先提取日記中實際出現的單字
        2. 進階單字可以是相關情境的延伸詞彙
        3. 避免重複相同的單字
        4. meaning 和 exampleTranslation 必須使用繁體中文
        5. 例句要簡單易懂
        6. 不要使用 Markdown 語法
        7. 請確保總數在 5-8 個單字之間`,
      en: `You are a professional Japanese teacher. The student's current JLPT level is ${userLevel}.
        Extract vocabulary from the following diary for learning:
        ${diaryText}

        Please extract two types of words:
        1. Current level (${userLevel}): 3-5 important words suitable for the student's current level
        2. Advanced level (${nextLevel}): 2-3 words one level higher to challenge the student

        Return a JSON array of words:
        {
          "words": [
            {
              "kanji": "Word in Kanji",
              "kana": "Kana reading",
              "meaning": "Meaning in English",
              "exampleJa": "Japanese example sentence (using this word)",
              "exampleTranslation": "English translation of the example sentence",
              "level": "${userLevel} or ${nextLevel}"
            }
          ]
        }

        Important:
        1. Prioritize words that actually appear in the diary
        2. Advanced words can be contextually related vocabulary
        3. Avoid duplicate words
        4. meaning and exampleTranslation must be in English
        5. Example sentences should be simple and easy to understand
        6. Do not use Markdown syntax
        7. Ensure total is between 5-8 words`
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

    // 轉換為 Word 格式並去重
    const seenWords = new Set<string>();
    const words: Word[] = [];

    (parsedResult.words || []).forEach((w: any, index: number) => {
      // 使用漢字+假名作為唯一識別
      const wordKey = `${w.kanji}-${w.kana}`;

      // 如果已經出現過，跳過
      if (seenWords.has(wordKey)) {
        return;
      }

      seenWords.add(wordKey);

      words.push({
        id: `diary-word-${Date.now()}-${index}`,
        level: w.level || userLevel,
        kanji: w.kanji || '',
        kana: w.kana || '',
        meaning: w.meaning || '',
        exampleJa: w.exampleJa,
        exampleTranslation: w.exampleTranslation,
        familiarity: 0,
        flagged: false,
      });
    });

    return words;
  } catch (error) {
    console.error('提取單字失敗:', error);
    return [];
  }
}

/**
 * 驗證 Gemini API Key 是否有效
 */
export async function verifyGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    if (!apiKey || apiKey.trim() === '') {
      return false;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    // 發送一個簡單的測試請求
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello',
    });

    // 如果能成功獲取回應，則 API Key 有效
    return !!response.text;
  } catch (error) {
    console.error('API Key 驗證失敗:', error);
    return false;
  }
}
