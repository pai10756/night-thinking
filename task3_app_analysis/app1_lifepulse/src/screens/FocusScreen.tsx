import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');
const TIMER_SIZE = width * 0.65;

const SESSION_OPTIONS = [
  { label: '25 分鐘', minutes: 25 },
  { label: '45 分鐘', minutes: 45 },
  { label: '自訂', minutes: 60 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function FocusScreen() {
  const [selectedSession, setSelectedSession] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_OPTIONS[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = SESSION_OPTIONS[selectedSession].minutes * 60;

  useEffect(() => {
    if (isRunning) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleSessionSelect = (index: number) => {
    if (isRunning) return;
    setSelectedSession(index);
    setTimeLeft(SESSION_OPTIONS[index].minutes * 60);
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(SESSION_OPTIONS[selectedSession].minutes * 60);
  };

  const progress = 1 - timeLeft / totalSeconds;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>專注模式</Text>

        {/* Timer */}
        <View style={styles.timerSection}>
          <Animated.View
            style={[
              styles.timerOuter,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            {/* Outer ring glow */}
            <LinearGradient
              colors={
                isRunning
                  ? [Colors.primary + '60', Colors.secondary + '40', 'transparent']
                  : [Colors.surfaceLight + '60', 'transparent']
              }
              style={styles.timerGlow}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            {/* Timer circle */}
            <View style={styles.timerCircle}>
              {/* Progress ring background */}
              <View style={styles.progressRingBg} />
              {/* Progress ring */}
              <View
                style={[
                  styles.progressRing,
                  {
                    borderColor: isRunning ? Colors.primary : Colors.surfaceLight,
                    borderTopColor: Colors.primary,
                    borderRightColor: progress > 0.25 ? Colors.primaryLight : (isRunning ? Colors.primary : Colors.surfaceLight),
                    borderBottomColor: progress > 0.5 ? Colors.secondary : (isRunning ? Colors.primary : Colors.surfaceLight),
                    borderLeftColor: progress > 0.75 ? Colors.secondary : (isRunning ? Colors.primary : Colors.surfaceLight),
                    transform: [{ rotate: '-90deg' }],
                  },
                ]}
              />
              {/* Inner content */}
              <View style={styles.timerInner}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.timerSubtext}>
                  {isRunning ? '專注中...' : '準備開始'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Session Type Selector */}
        <View style={styles.sessionSelector}>
          {SESSION_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSessionSelect(index)}
              activeOpacity={0.7}
              style={[
                styles.sessionOption,
                selectedSession === index && styles.sessionOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.sessionOptionText,
                  selectedSession === index && styles.sessionOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {isRunning && (
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>重置</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
            <LinearGradient
              colors={
                isRunning
                  ? [Colors.warning, Colors.error]
                  : [Colors.primary, Colors.primaryLight]
              }
              style={styles.mainButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.mainButtonText}>
                {isRunning ? '暫停' : '開始專注'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>今日統計</Text>
          <View style={styles.statsGrid}>
            <StatCard label="今日專注" value="2 小時 15 分" />
            <StatCard label="完成次數" value="3 次" />
            <StatCard label="最佳專注" value="45 分鐘" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    alignSelf: 'flex-start',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: TIMER_SIZE + 40,
  },
  timerOuter: {
    width: TIMER_SIZE + 30,
    height: TIMER_SIZE + 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerGlow: {
    position: 'absolute',
    width: TIMER_SIZE + 30,
    height: TIMER_SIZE + 30,
    borderRadius: (TIMER_SIZE + 30) / 2,
  },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingBg: {
    position: 'absolute',
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    borderWidth: 6,
    borderColor: Colors.surfaceLight,
  },
  progressRing: {
    position: 'absolute',
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    borderWidth: 6,
  },
  timerInner: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    width: TIMER_SIZE - 24,
    height: TIMER_SIZE - 24,
    borderRadius: (TIMER_SIZE - 24) / 2,
    justifyContent: 'center',
  },
  timerText: {
    fontSize: FontSizes.xxxl + 8,
    fontWeight: '200',
    color: Colors.textPrimary,
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  timerSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  sessionSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionOption: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
  },
  sessionOptionActive: {
    backgroundColor: Colors.primary,
  },
  sessionOptionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sessionOptionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  mainButton: {
    paddingHorizontal: 48,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mainButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  resetButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  statsSection: {
    width: '100%',
    marginBottom: Spacing.xxxl,
  },
  statsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
