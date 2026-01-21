import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { memo, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { DiaryEntry } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";
import type { ThemeColors } from "../../constants/colors";

const keyExtractor = (item: DiaryEntry) => item.id;

interface DiaryHistoryProps {
  diaryEntries: DiaryEntry[];
  onBack: () => void;
  onSelectDiary: (diary: DiaryEntry) => void;
}

export default memo(function DiaryHistory({
  diaryEntries,
  onBack,
  onSelectDiary,
}: DiaryHistoryProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const reversedEntries = useMemo(
    () => diaryEntries.slice().reverse(),
    [diaryEntries],
  );

  const renderItem = useCallback(
    ({ item }: { item: DiaryEntry }) => (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => onSelectDiary(item)}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>
            {new Date(item.createdAt).toLocaleDateString(i18n.language, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        </View>
        <Text style={styles.historyPreview} numberOfLines={2}>
          {item.original}
        </Text>
      </TouchableOpacity>
    ),
    [styles, onSelectDiary, i18n.language],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Ionicons
          name="document-text-outline"
          size={64}
          color={colors.textTertiary}
        />
        <Text style={styles.emptyText}>{t("noDiaryYet")}</Text>
      </View>
    ),
    [styles, t],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t("diaryHistory")}</Text>
        </View>
      </View>
      <FlatList
        data={reversedEntries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingTop: 8,
    },
    header: {
      padding: 20,
      backgroundColor: colors.cardBackground,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      padding: 48,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textTertiary,
      marginTop: 16,
    },
    historyItem: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    historyDate: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    historyPreview: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
