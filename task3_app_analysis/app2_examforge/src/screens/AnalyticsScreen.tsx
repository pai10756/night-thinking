import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadows, FontSizes } from '../constants/theme';
import { analyticsCategories, weeklyStudyTime } from '../constants/mockData';

const overallMastery = 70;

function MasteryRing() {
  const size = 140;
  const strokeWidth = 12;
  const center = size / 2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progressOffset = circumference * (1 - overallMastery / 100);

  return (
    <View style={styles.ringContainer}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Background circle using View */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: Colors.primaryLight,
            position: 'absolute',
          }}
        />
        {/* We'll use a simpler visual approach with a colored arc indicator */}
        <View
          style={{
            width: size - strokeWidth * 2 + 4,
            height: size - strokeWidth * 2 + 4,
            borderRadius: (size - strokeWidth * 2 + 4) / 2,
            borderWidth: strokeWidth - 2,
            borderColor: Colors.primary,
            borderTopColor: Colors.primary,
            borderRightColor: Colors.primary,
            borderBottomColor: overallMastery > 50 ? Colors.primary : Colors.primaryLight,
            borderLeftColor: overallMastery > 75 ? Colors.primary : Colors.primaryLight,
            position: 'absolute',
            transform: [{ rotate: '-45deg' }],
          }}
        />
        <View style={styles.ringCenter}>
          <Text style={styles.ringPercentage}>{overallMastery}%</Text>
          <Text style={styles.ringLabel}>整體掌握度</Text>
        </View>
      </View>
    </View>
  );
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'mastered':
      return { label: '已精通', color: Colors.correct, bg: Colors.correctLight };
    case 'proficient':
      return { label: '熟練中', color: Colors.primary, bg: Colors.primaryLight };
    case 'review':
      return { label: '需加強', color: Colors.review, bg: Colors.reviewLight };
    case 'weak':
      return { label: '薄弱', color: Colors.weak, bg: Colors.weakLight };
    default:
      return { label: '', color: Colors.textSecondary, bg: Colors.surface };
  }
}

function WeeklyChart() {
  const maxMinutes = Math.max(...weeklyStudyTime.map((d) => d.minutes));

  return (
    <View style={styles.chartContainer}>
      {weeklyStudyTime.map((item, index) => {
        const barHeight = (item.minutes / maxMinutes) * 100;
        return (
          <View key={index} style={styles.chartBarColumn}>
            <Text style={styles.chartBarValue}>{item.minutes}m</Text>
            <View style={styles.chartBarTrack}>
              <View
                style={[
                  styles.chartBarFill,
                  {
                    height: `${barHeight}%`,
                    backgroundColor:
                      index === weeklyStudyTime.length - 2
                        ? Colors.primary
                        : Colors.primaryLight,
                  },
                ]}
              />
            </View>
            <Text style={styles.chartBarLabel}>{item.day}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>學習分析</Text>

        {/* Mastery Ring */}
        <View style={styles.card}>
          <MasteryRing />
        </View>

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>各科目掌握度</Text>
        <View style={styles.card}>
          {analyticsCategories.map((cat, index) => {
            const info = getStatusInfo(cat.status);
            return (
              <View
                key={index}
                style={[
                  styles.categoryRow,
                  index < analyticsCategories.length - 1 && styles.categoryRowBorder,
                ]}
              >
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: info.bg }]}>
                    <Text style={[styles.statusText, { color: info.color }]}>
                      {info.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryProgress}>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${cat.mastery}%`,
                          backgroundColor: info.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.categoryPercent, { color: info.color }]}>
                    {cat.mastery}%
                  </Text>
                </View>
                <Text style={styles.categoryDetail}>
                  {cat.correct}/{cat.total} 題正確
                </Text>
              </View>
            );
          })}
        </View>

        {/* Weekly Study Time */}
        <Text style={styles.sectionTitle}>本週學習時間</Text>
        <View style={styles.card}>
          <WeeklyChart />
        </View>

        {/* AI Recommendation */}
        <Text style={styles.sectionTitle}>AI 學習建議</Text>
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.aiTitle}>智慧建議</Text>
          </View>
          <Text style={styles.aiText}>
            建議加強「法規常識」，過去 10 題中正確率僅 40%。建議每天花 10
            分鐘專注練習此科目，預計一週內可提升至 60% 以上。
          </Text>
          <View style={styles.aiAction}>
            <Text style={styles.aiActionText}>開始加強練習</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.secondary} />
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  screenTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  ringContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  ringCenter: {
    alignItems: 'center',
  },
  ringPercentage: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.primary,
  },
  ringLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryRow: {
    paddingVertical: Spacing.md,
  },
  categoryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  categoryPercent: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  categoryDetail: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: Spacing.base,
  },
  chartBarColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarValue: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  chartBarTrack: {
    width: 24,
    height: 100,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  chartBarLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  aiCard: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  aiTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.secondary,
  },
  aiText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  aiAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiActionText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.secondary,
    marginRight: Spacing.xs,
  },
});
