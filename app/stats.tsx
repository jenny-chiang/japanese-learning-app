import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { useAppStore } from '../src/store/useAppStore';
import { useTheme } from '../src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month'>('week');

  const {
    stats,
    getWeeklyStudyTrend,
    getMonthlyStudyTrend,
    getWordsFamiliarityDistribution,
  } = useAppStore();

  const styles = createStyles(colors);

  // 獲取學習趨勢數據
  const trendData =
    trendPeriod === 'week' ? getWeeklyStudyTrend() : getMonthlyStudyTrend();

  // 格式化日期標籤
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 準備學習時長圖表數據 (gifted-charts 格式)
  const durationChartData = trendData.map((d, index) => ({
    value: d.duration,
    label: trendPeriod === 'month' && index % 5 !== 0 && index !== trendData.length - 1
      ? ''
      : formatDateLabel(d.date),
    dataPointText: d.duration > 0 ? `${d.duration}` : '',
  }));

  // 準備單字學習圖表數據 (gifted-charts 格式)
  const wordsChartData = trendData.map((d, index) => ({
    value: d.words,
    label: trendPeriod === 'month' && index % 5 !== 0 && index !== trendData.length - 1
      ? ''
      : formatDateLabel(d.date),
    frontColor: '#10B981',
  }));

  // 單字熟悉度分布
  const familiarityDist = getWordsFamiliarityDistribution();
  const totalWords = familiarityDist.reduce((sum, item) => sum + item.count, 0);

  const familiarityLabels = [
    t('familiarity0'),
    t('familiarity1'),
    t('familiarity2'),
    t('familiarity3'),
  ];

  const familiarityColors = ['#EF4444', '#F59E0B', '#10B981', '#6366F1'];

  // 準備圓餅圖數據 (gifted-charts 格式)
  const familiarityChartData = familiarityDist
    .filter(item => item.count > 0)
    .map((item, index) => ({
      value: item.count,
      color: familiarityColors[item.level],
      text: `${Math.round((item.count / totalWords) * 100)}%`,
    }));

  // 計算統計數據
  const totalStudyTime = Object.values(stats.dailyHistory).reduce(
    (sum, day) => sum + (day.studyDuration || 0),
    0
  );

  const avgDailyTime =
    stats.totalDays > 0 ? Math.round(totalStudyTime / stats.totalDays) : 0;

  return (
    <ScrollView style={styles.container}>
      {/* 整體統計卡片 */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{t('overallStats')}</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalDays}</Text>
            <Text style={styles.summaryLabel}>{t('totalDays')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalStudyTime}</Text>
            <Text style={styles.summaryLabel}>{t('totalMinutes')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgDailyTime}</Text>
            <Text style={styles.summaryLabel}>{t('avgDailyTime')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.currentStreak}</Text>
            <Text style={styles.summaryLabel}>{t('currentStreak')}</Text>
          </View>
        </View>
      </View>

      {/* 學習時長趨勢 */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{t('studyDurationTrend')}</Text>
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                trendPeriod === 'week' && styles.toggleButtonActive,
              ]}
              onPress={() => setTrendPeriod('week')}
            >
              <Text
                style={[
                  styles.toggleText,
                  trendPeriod === 'week' && styles.toggleTextActive,
                ]}
              >
                {t('week')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                trendPeriod === 'month' && styles.toggleButtonActive,
              ]}
              onPress={() => setTrendPeriod('month')}
            >
              <Text
                style={[
                  styles.toggleText,
                  trendPeriod === 'month' && styles.toggleTextActive,
                ]}
              >
                {t('month')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartWrapper}>
          <LineChart
            data={durationChartData}
            width={width - 140}
            height={220}
            color={colors.primary}
            thickness={3}
            dataPointsColor={colors.primary}
            startFillColor={colors.primary}
            endFillColor={colors.primary}
            startOpacity={0.4}
            endOpacity={0.1}
            spacing={trendPeriod === 'week' ? 40 : 20}
            initialSpacing={10}
            noOfSections={4}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, width: 40 }}
            areaChart
            hideDataPoints={false}
            dataPointsRadius={4}
            textShiftY={-8}
            textShiftX={-5}
            textFontSize={10}
            textColor={colors.primary}
          />
        </View>
      </View>

      {/* 單字學習趨勢 */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{t('wordsLearnedTrend')}</Text>
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                trendPeriod === 'week' && styles.toggleButtonActive,
              ]}
              onPress={() => setTrendPeriod('week')}
            >
              <Text
                style={[
                  styles.toggleText,
                  trendPeriod === 'week' && styles.toggleTextActive,
                ]}
              >
                {t('week')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                trendPeriod === 'month' && styles.toggleButtonActive,
              ]}
              onPress={() => setTrendPeriod('month')}
            >
              <Text
                style={[
                  styles.toggleText,
                  trendPeriod === 'month' && styles.toggleTextActive,
                ]}
              >
                {t('month')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartWrapper}>
          <BarChart
            data={wordsChartData}
            width={width - 140}
            height={220}
            barWidth={trendPeriod === 'week' ? 30 : 15}
            spacing={trendPeriod === 'week' ? 20 : 8}
            initialSpacing={10}
            noOfSections={4}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, width: 40 }}
            frontColor={colors.success}
            showValuesAsTopLabel
            topLabelTextStyle={{ color: colors.success, fontSize: 10 }}
          />
        </View>
      </View>

      {/* 單字熟悉度分布 */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{t('familiarityDistribution')}</Text>
        {totalWords > 0 ? (
          <>
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={familiarityChartData}
                donut
                radius={90}
                innerRadius={50}
                innerCircleColor={colors.cardBackground}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={styles.pieCenterValue}>{totalWords}</Text>
                    <Text style={styles.pieCenterLabel}>單字</Text>
                  </View>
                )}
              />
            </View>
            <View style={styles.distributionStats}>
              {familiarityDist.map((item) => (
                <View key={item.level} style={styles.distributionItem}>
                  <View
                    style={[
                      styles.distributionDot,
                      { backgroundColor: familiarityColors[item.level] },
                    ]}
                  />
                  <Text style={styles.distributionLabel}>
                    {familiarityLabels[item.level]}:
                  </Text>
                  <Text style={styles.distributionValue}>
                    {item.count} ({Math.round((item.count / totalWords) * 100)}
                    %)
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('noWordsYet')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof import('../src/constants/colors').getTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  pieChartWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pieCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  pieCenterLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colors.white,
  },
  distributionStats: {
    marginTop: 16,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  distributionLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 4,
  },
  distributionValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
});
