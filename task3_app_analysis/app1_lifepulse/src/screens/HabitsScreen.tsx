import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, Spacing, BorderRadius } from '../constants/theme';

interface HabitData {
  id: string;
  emoji: string;
  name: string;
  streak: number;
  completed: boolean;
}

const initialHabits: HabitData[] = [
  { id: '1', emoji: '🌅', name: '早起', streak: 12, completed: true },
  { id: '2', emoji: '💧', name: '喝水 2000ml', streak: 8, completed: true },
  { id: '3', emoji: '🏃', name: '運動 30 分鐘', streak: 5, completed: false },
  { id: '4', emoji: '📖', name: '閱讀', streak: 21, completed: true },
  { id: '5', emoji: '🧘', name: '冥想', streak: 3, completed: false },
  { id: '6', emoji: '📵', name: '不滑手機', streak: 1, completed: true },
];

function getWeekDays() {
  const today = new Date();
  const days = [];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      dayName: dayNames[d.getDay()],
      date: d.getDate(),
      isToday: i === 0,
      completionDots: i < 0 ? Math.floor(Math.random() * 3) + 4 : i === 0 ? 4 : 0,
    });
  }
  return days;
}

function WeekStrip() {
  const days = getWeekDays();

  return (
    <View style={styles.weekStrip}>
      {days.map((day, index) => (
        <View key={index} style={styles.dayColumn}>
          <Text style={[styles.dayName, day.isToday && styles.dayNameToday]}>
            {day.dayName}
          </Text>
          <View
            style={[
              styles.dayCircle,
              day.isToday && styles.dayCircleToday,
            ]}
          >
            <Text style={[styles.dayDate, day.isToday && styles.dayDateToday]}>
              {day.date}
            </Text>
          </View>
          <View style={styles.dotsRow}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.completionDot,
                  i < day.completionDots
                    ? styles.completionDotFilled
                    : styles.completionDotEmpty,
                ]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function HabitCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: checked ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [checked]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.surfaceLight, Colors.success],
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.checkbox,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor,
          },
        ]}
      >
        {checked && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function HabitItem({ habit, onToggle }: { habit: HabitData; onToggle: () => void }) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = parseInt(habit.id) * 100;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.habitItem,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.habitLeft}>
        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
        <View style={styles.habitInfo}>
          <Text style={[styles.habitName, habit.completed && styles.habitNameCompleted]}>
            {habit.name}
          </Text>
          <Text style={styles.habitStreak}>
            🔥 連續 {habit.streak} 天
          </Text>
        </View>
      </View>
      <HabitCheckbox checked={habit.completed} onToggle={onToggle} />
    </Animated.View>
  );
}

export default function HabitsScreen() {
  const [habits, setHabits] = useState(initialHabits);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const completedCount = habits.filter((h) => h.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>習慣追蹤</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {completedCount}/{habits.length}
            </Text>
          </View>
        </View>

        {/* Weekly Calendar Strip */}
        <WeekStrip />

        {/* Habit List */}
        <View style={styles.habitList}>
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabit(habit.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity activeOpacity={0.8}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  dayName: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  dayNameToday: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    backgroundColor: Colors.primary,
  },
  dayDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dayDateToday: {
    color: Colors.white,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  completionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  completionDotFilled: {
    backgroundColor: Colors.success,
  },
  completionDotEmpty: {
    backgroundColor: Colors.surfaceLight,
  },
  habitList: {
    gap: Spacing.md,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitEmoji: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  habitNameCompleted: {
    color: Colors.textSecondary,
  },
  habitStreak: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  checkmark: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
