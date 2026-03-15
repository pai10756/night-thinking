import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadows, FontSizes } from '../constants/theme';
import { userProfile, todayPlan, recentActivity } from '../constants/mockData';

type NavigationProp = {
  navigate: (screen: string) => void;
};

export default function HomeScreen({ navigation }: { navigation: NavigationProp }) {
  const progress = todayPlan.completedQuestions / todayPlan.targetQuestions;

  const quickActions = [
    { icon: 'flash' as const, label: '快速練習', color: Colors.primary, bg: Colors.primaryLight },
    { icon: 'document-text' as const, label: '模擬考試', color: Colors.secondary, bg: Colors.secondaryLight },
    { icon: 'locate' as const, label: '弱點加強', color: Colors.weak, bg: Colors.weakLight },
    { icon: 'star' as const, label: '每日挑戰', color: Colors.review, bg: Colors.reviewLight },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>嗨，{userProfile.name} 👋</Text>
            <View style={styles.streakRow}>
              <Text style={styles.streakText}>
                連續學習 {userProfile.streak} 天 🔥
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={36} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Today's Plan */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Ionicons name="today-outline" size={20} color={Colors.primary} />
            <Text style={styles.planTitle}>今日學習計畫</Text>
          </View>
          <Text style={styles.planTarget}>
            今日目標: 完成 {todayPlan.targetQuestions} 題
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {todayPlan.completedQuestions}/{todayPlan.targetQuestions}
            </Text>
          </View>
          <View style={styles.planFooter}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.planEstimate}>
              預計剩餘: {todayPlan.estimatedMinutes} 分鐘
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>快速開始</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => {
                if (index === 0) navigation.navigate('Practice');
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>最近學習紀錄</Text>
        {recentActivity.map((item) => (
          <View key={item.id} style={styles.activityCard}>
            <View style={styles.activityLeft}>
              <Text style={styles.activityTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.activityDate}>{item.date}</Text>
            </View>
            <View style={styles.activityRight}>
              <Text
                style={[
                  styles.activityScore,
                  {
                    color:
                      item.scorePercent >= 80
                        ? Colors.correct
                        : item.scorePercent >= 60
                        ? Colors.review
                        : Colors.weak,
                  },
                ]}
              >
                {item.score}
              </Text>
            </View>
          </View>
        ))}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  greeting: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  streakText: {
    fontSize: FontSizes.sm,
    color: Colors.streak,
    fontWeight: '600',
  },
  profileButton: {
    padding: Spacing.xs,
  },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  planTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  planTarget: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  progressText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planEstimate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  activityLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  activityTitle: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  activityDate: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityScore: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
