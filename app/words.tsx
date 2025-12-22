import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';
import { Word, FamiliarityLevel } from '../src/types';
import { Colors } from '../src/constants/colors';

enum WordTab {
  Today = 'today',
  All = 'all',
  Flagged = 'flagged',
  Wrong = 'wrong',
}

export default function WordsScreen() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<WordTab>(WordTab.Today);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const {
    words,
    todayWords,
    wrongWords,
    updateWordFamiliarity,
    flagWord,
    recordStudyTime,
  } = useAppStore();

  // 開始練習時記錄時間
  useEffect(() => {
    if (practiceMode && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  }, [practiceMode]);

  // 結束練習時記錄學習時長
  const endPractice = () => {
    if (startTimeRef.current) {
      const duration = Math.round(
        (Date.now() - startTimeRef.current) / 1000 / 60
      ); // 分鐘
      if (duration > 0) {
        recordStudyTime(duration);
      }
      startTimeRef.current = null;
    }
    setPracticeMode(false);
    setCurrentWordIndex(0);
  };

  const getDisplayWords = () => {
    switch (selectedTab) {
      case WordTab.Today:
        return todayWords;
      case WordTab.Flagged:
        return words.filter((w: Word) => w.flagged);
      case WordTab.Wrong:
        return wrongWords;
      case WordTab.All:
      default:
        return words;
    }
  };

  const displayWords = getDisplayWords();
  const currentWord = displayWords[currentWordIndex];

  const familiarityOptions = [
    { level: FamiliarityLevel.DontKnow, style: styles.lowButton, textKey: 'dontKnow' },
    { level: FamiliarityLevel.SoSo, style: styles.mediumLowButton, textKey: 'soSo' },
    { level: FamiliarityLevel.Know, style: styles.mediumButton, textKey: 'know' },
    { level: FamiliarityLevel.VeryFamiliar, style: styles.highButton, textKey: 'know' },
  ];

  const handleFamiliarityUpdate = (familiarity: FamiliarityLevel) => {
    if (currentWord) {
      updateWordFamiliarity(currentWord.id, familiarity);
      setShowMeaning(false);

      if (currentWordIndex < displayWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        endPractice();
      }
    }
  };

  const renderWordItem = ({ item }: { item: Word }) => (
    <View style={styles.wordItem}>
      <View style={styles.wordContent}>
        <Text style={styles.wordKanji}>{item.kanji}</Text>
        <Text style={styles.wordKana}>{item.kana}</Text>
        <Text style={styles.wordMeaning}>{item.meaning}</Text>
      </View>
      <View style={styles.wordItemRight}>
        <View style={styles.familiarityBadge}>
          <Text style={styles.familiarityText}>{item.familiarity}/3</Text>
        </View>
        <TouchableOpacity
          onPress={() => flagWord(item.id, !item.flagged)}
          style={styles.flagButton}
        >
          <Ionicons
            name={item.flagged ? 'star' : 'star-outline'}
            size={24}
            color={item.flagged ? '#FBBF24' : '#D1D5DB'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === WordTab.Today && styles.activeTab,
          ]}
          onPress={() => setSelectedTab(WordTab.Today)}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === WordTab.Today && styles.activeTabText,
            ]}
          >
            {t('todayTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === WordTab.All && styles.activeTab]}
          onPress={() => setSelectedTab(WordTab.All)}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === WordTab.All && styles.activeTabText,
            ]}
          >
            {t('allTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === WordTab.Wrong && styles.activeTab,
          ]}
          onPress={() => setSelectedTab(WordTab.Wrong)}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === WordTab.Wrong && styles.activeTabText,
            ]}
          >
            {t('wrongTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === WordTab.Flagged && styles.activeTab,
          ]}
          onPress={() => setSelectedTab(WordTab.Flagged)}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === WordTab.Flagged && styles.activeTabText,
            ]}
          >
            {t('flaggedTab')}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === WordTab.Today && todayWords.length > 0 && (
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => {
            setPracticeMode(true);
            setCurrentWordIndex(0);
            setShowMeaning(false);
          }}
        >
          <Ionicons name='play-circle' size={24} color='#fff' />
          <Text style={styles.practiceButtonText}>{t('startPractice')}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={displayWords}
        renderItem={renderWordItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name='book-outline' size={64} color='#D1D5DB' />
            <Text style={styles.emptyText}>沒有單字</Text>
          </View>
        }
      />

      <Modal visible={practiceMode} animationType='slide' transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.practiceCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setPracticeMode(false);
                setShowMeaning(false);
              }}
            >
              <Ionicons name='close' size={24} color='#6B7280' />
            </TouchableOpacity>

            <View style={styles.practiceHeader}>
              <Text style={styles.progressText}>
                {currentWordIndex + 1} / {displayWords.length}
              </Text>
              {currentWord && (
                <TouchableOpacity
                  onPress={() => flagWord(currentWord.id, !currentWord.flagged)}
                  style={styles.practiceFlagButton}
                >
                  <Ionicons
                    name={currentWord.flagged ? 'star' : 'star-outline'}
                    size={28}
                    color={currentWord.flagged ? '#FBBF24' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              )}
            </View>

            {currentWord && (
              <>
                <View style={styles.wordDisplay}>
                  <Text style={styles.practiceKanji}>{currentWord.kanji}</Text>
                  <Text style={styles.practiceKana}>{currentWord.kana}</Text>
                </View>

                {showMeaning ? (
                  <View style={styles.meaningDisplay}>
                    <Text style={styles.practiceMeaning}>
                      {currentWord.meaning}
                    </Text>
                    {currentWord.exampleJa && (
                      <>
                        <Text style={styles.exampleJa}>
                          {currentWord.exampleJa}
                        </Text>
                        <Text style={styles.exampleTranslation}>
                          {currentWord.exampleTranslation}
                        </Text>
                      </>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.showButton}
                    onPress={() => setShowMeaning(true)}
                  >
                    <Text style={styles.showButtonText}>
                      {t('showMeaning')}
                    </Text>
                  </TouchableOpacity>
                )}

                {showMeaning && (
                  <View style={styles.familiarityButtons}>
                    {familiarityOptions.map((option) => (
                      <TouchableOpacity
                        key={option.level}
                        style={[styles.familiarityButton, option.style]}
                        onPress={() => handleFamiliarityUpdate(option.level)}
                      >
                        <Text style={styles.buttonText}>{t(option.textKey)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  practiceButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  list: {
    padding: 16,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  wordContent: {
    flex: 1,
  },
  wordItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagButton: {
    padding: 4,
  },
  wordKanji: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  wordKana: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  wordMeaning: {
    fontSize: 14,
    color: '#374151',
  },
  familiarityBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  familiarityText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  practiceCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  practiceFlagButton: {
    padding: 4,
  },
  progressText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  wordDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  practiceKanji: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  practiceKana: {
    fontSize: 20,
    color: '#6B7280',
  },
  meaningDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  practiceMeaning: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  exampleJa: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  exampleTranslation: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  showButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  showButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  familiarityButtons: {
    gap: 12,
  },
  familiarityButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  lowButton: {
    backgroundColor: '#FEE2E2',
  },
  mediumLowButton: {
    backgroundColor: '#FED7AA',
  },
  mediumButton: {
    backgroundColor: '#FEF3C7',
  },
  highButton: {
    backgroundColor: '#D1FAE5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
