/**
 * 基本功能測試 - 驗證測試環境配置
 */

describe('測試環境配置', () => {
  test('基本數學運算', () => {
    expect(1 + 1).toBe(2);
  });

  test('字串操作', () => {
    const text = 'こんにちは';
    expect(text).toBe('こんにちは');
    expect(text.length).toBe(5);
  });

  test('陣列操作', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
  });

  test('物件操作', () => {
    const obj = {
      level: 'N3',
      wordsPerDay: 10,
    };
    expect(obj).toHaveProperty('level');
    expect(obj.level).toBe('N3');
  });

  test('非同步操作', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
});

describe('TypeScript 型別測試', () => {
  test('JLPT 等級', () => {
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    expect(levels).toContain('N3');
  });

  test('熟悉度等級', () => {
    enum FamiliarityLevel {
      DontKnow = 0,
      SoSo = 1,
      Know = 2,
      VeryFamiliar = 3,
    }

    expect(FamiliarityLevel.DontKnow).toBe(0);
    expect(FamiliarityLevel.VeryFamiliar).toBe(3);
  });
});
