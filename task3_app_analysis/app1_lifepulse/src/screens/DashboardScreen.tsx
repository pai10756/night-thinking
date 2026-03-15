import React, { useEffect, useRef } from 'react';
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '早安';
  if (hour < 18) return '午安';
  return '晚安';
}

function CircularProgress({ score, size = 160 }: { score: number; size?: number }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const animatedText = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      {/* Background circle */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: Colors.surfaceLight,
          position: 'absolute',
        }}
      />
      {/* Progress circle - simulated with border */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: Colors.primary,
          borderTopColor: Colors.primary,
          borderRightColor: Colors.primaryLight,
          borderBottomColor: score > 50 ? Colors.secondary : Colors.surfaceLight,
          borderLeftColor: score > 75 ? Colors.secondary : Colors.surfaceLight,
          position: 'absolute',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      {/* Inner content */}
      <View style={{ alignItems: 'center' }}>
        <AnimatedNumber value={animatedText} />
        <Text style={{ color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: 2 }}>
          生活分數
        </Text>
      </View>
    </View>
  );
}

function AnimatedNumber({ value }: { value: Animated.AnimatedInterpolation<number> }) {
  const [display, setDisplay] = React.useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 78,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    animValue.addListener(({ value: v }) => {
      setDisplay(Math.round(v));
    });

    return () => animValue.removeAllListeners();
  }, []);

  return (
    <Text style={{ color: Colors.textPrimary, fontSize: FontSizes.xxxl, fontWeight: '700' }}>
      {display}
    </Text>
  );
}

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle: string;
  trendUp?: boolean;
  color: string;
}

function MetricCard({ icon, label, value, subtitle, trendUp, color }: MetricCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.metricCard,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={[styles.metricIconContainer, { backgroundColor: color + '20' }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {trendUp !== undefined && (
          <Text style={{ color: trendUp ? Colors.success : Colors.error, fontSize: FontSizes.sm, marginLeft: 4 }}>
            {trendUp ? '↑' : '↓'}
          </Text>
        )}
      </View>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}，小明 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>明</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Life Score */}
        <Animated.View style={[styles.scoreSection, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[Colors.surface, Colors.surfaceLight + '60']}
            style={styles.scoreCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <CircularProgress score={78} />
          </LinearGradient>
        </Animated.View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="🌙"
            label="睡眠品質"
            value="82 分"
            subtitle="7.5 小時"
            trendUp={false}
            color={Colors.primary}
          />
          <MetricCard
            icon="✅"
            label="習慣完成"
            value="4/6"
            subtitle="完成率 67%"
            trendUp={true}
            color={Colors.success}
          />
          <MetricCard
            icon="⏱️"
            label="專注時間"
            value="2.5 hr"
            subtitle="今日累計"
            trendUp={true}
            color={Colors.secondary}
          />
          <MetricCard
            icon="💰"
            label="本月支出"
            value="$12,450"
            subtitle="預算 75%"
            trendUp={false}
            color={Colors.warning}
          />
        </View>

        {/* AI Insight */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={[Colors.primary + '30', Colors.secondary + '20']}
            style={styles.insightCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.insightHeader}>
              <Text style={{ fontSize: 18 }}>🤖</Text>
              <Text style={styles.insightTitle}>AI 洞察</Text>
            </View>
            <Text style={styles.insightText}>
              你最近三天睡眠品質下降 15%，建議今晚提早 30 分鐘上床。根據你的數據，早睡的隔天專注力提升 20%。
            </Text>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cardWidth = (width - Spacing.xxl * 2 - Spacing.md) / 2;

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  avatarContainer: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  scoreCard: {
    width: '100%',
    paddingVertical: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  metricCard: {
    width: cardWidth,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  metricLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metricSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  insightCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  insightTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  insightText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
