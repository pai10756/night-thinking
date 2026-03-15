import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

const WEEKLY_DATA = [
  { day: '一', value: 65 },
  { day: '二', value: 78 },
  { day: '三', value: 55 },
  { day: '四', value: 82 },
  { day: '五', value: 90 },
  { day: '六', value: 72 },
  { day: '日', value: 85 },
];

const AI_INSIGHTS = [
  {
    emoji: '💤',
    text: '週三晚睡時，週四消費平均多 40%',
    tag: '消費模式',
    tagColor: Colors.warning,
  },
  {
    emoji: '🏃',
    text: '運動後的睡眠深層比例提升 25%',
    tag: '睡眠品質',
    tagColor: Colors.primary,
  },
  {
    emoji: '🧠',
    text: '你的最佳專注時段是上午 9-11 點',
    tag: '生產力',
    tagColor: Colors.secondary,
  },
  {
    emoji: '📱',
    text: '減少螢幕時間的日子，睡眠評分平均高 12 分',
    tag: '數位健康',
    tagColor: Colors.success,
  },
];

const TRENDS = [
  { label: '睡眠趨勢', value: '+8%', up: true, icon: '🌙' },
  { label: '習慣完成率', value: '82%', up: true, icon: '✅' },
  { label: '專注趨勢', value: '+15%', up: true, icon: '⏱️' },
  { label: '支出控制', value: '-5%', up: false, icon: '💰' },
];

function BarChart() {
  const maxValue = Math.max(...WEEKLY_DATA.map((d) => d.value));
  const barAnims = WEEKLY_DATA.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    const animations = barAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: false,
      })
    );
    Animated.stagger(80, animations).start();
  }, []);

  const chartWidth = width - Spacing.xxl * 2 - Spacing.xl * 2;
  const barWidth = (chartWidth - (WEEKLY_DATA.length - 1) * 8) / WEEKLY_DATA.length;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barsRow}>
        {WEEKLY_DATA.map((item, index) => {
          const barHeight = barAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, (item.value / maxValue) * 120],
          });

          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <Animated.View style={{ height: barHeight, width: barWidth, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={[styles.bar, { width: barWidth, height: 120 }]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                  />
                </Animated.View>
              </View>
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function InsightCard({
  emoji,
  text,
  tag,
  tagColor,
  index,
}: {
  emoji: string;
  text: string;
  tag: string;
  tagColor: string;
  index: number;
}) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.insightCard,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.insightEmoji}>{emoji}</Text>
      <View style={styles.insightContent}>
        <Text style={styles.insightText}>{text}</Text>
        <View style={[styles.insightTag, { backgroundColor: tagColor + '20' }]}>
          <Text style={[styles.insightTagText, { color: tagColor }]}>{tag}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>洞察</Text>

        {/* Weekly Summary */}
        <View style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <Text style={styles.weeklyTitle}>本週生活分數</Text>
            <View style={styles.weeklyBadge}>
              <Text style={styles.weeklyAvg}>平均 75 分</Text>
            </View>
          </View>
          <BarChart />
        </View>

        {/* Trend Badges */}
        <View style={styles.trendsRow}>
          {TRENDS.map((trend, index) => (
            <View key={index} style={styles.trendBadge}>
              <Text style={{ fontSize: 16 }}>{trend.icon}</Text>
              <Text style={styles.trendLabel}>{trend.label}</Text>
              <Text
                style={[
                  styles.trendValue,
                  { color: trend.up ? Colors.success : Colors.error },
                ]}
              >
                {trend.value} {trend.up ? '↑' : '↓'}
              </Text>
            </View>
          ))}
        </View>

        {/* AI Insights */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
            <Text style={styles.aiTitle}>AI 深度洞察</Text>
          </View>
          {AI_INSIGHTS.map((insight, index) => (
            <InsightCard key={index} index={index} {...insight} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  weeklyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  weeklyTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  weeklyBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  weeklyAvg: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    width: '100%',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  barLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  trendsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  trendBadge: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    width: (width - Spacing.xxl * 2 - Spacing.md) / 2 - 1,
  },
  trendLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  trendValue: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  aiSection: {
    marginBottom: Spacing.xxl,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  aiTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  insightTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  insightTagText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});
