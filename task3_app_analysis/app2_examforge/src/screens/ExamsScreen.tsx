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
import { examModules } from '../constants/mockData';

export default function ExamsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>考試模組</Text>
        <Text style={styles.screenSubtitle}>選擇你想準備的考試，開始學習之旅</Text>

        {examModules.map((exam) => (
          <TouchableOpacity key={exam.id} style={styles.examCard} activeOpacity={0.7}>
            <View style={styles.examTop}>
              <Text style={styles.examFlag}>{exam.flag}</Text>
              <View style={styles.examInfo}>
                <Text style={styles.examName}>{exam.name}</Text>
                <Text style={styles.examQuestions}>
                  共 {exam.totalQuestions.toLocaleString()} 題
                </Text>
              </View>
              <View
                style={[
                  styles.priceBadge,
                  {
                    backgroundColor: exam.purchased
                      ? Colors.correctLight
                      : Colors.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priceText,
                    {
                      color: exam.purchased ? Colors.correct : Colors.primary,
                    },
                  ]}
                >
                  {exam.price}
                </Text>
              </View>
            </View>

            {exam.purchased && exam.mastery > 0 && (
              <View style={styles.masterySection}>
                <View style={styles.masteryHeader}>
                  <Text style={styles.masteryLabel}>掌握度</Text>
                  <Text
                    style={[
                      styles.masteryPercent,
                      {
                        color:
                          exam.mastery >= 80
                            ? Colors.correct
                            : exam.mastery >= 60
                            ? Colors.primary
                            : exam.mastery >= 40
                            ? Colors.review
                            : Colors.weak,
                      },
                    ]}
                  >
                    {exam.mastery}%
                  </Text>
                </View>
                <View style={styles.masteryBar}>
                  <View
                    style={[
                      styles.masteryBarFill,
                      {
                        width: `${exam.mastery}%`,
                        backgroundColor:
                          exam.mastery >= 80
                            ? Colors.correct
                            : exam.mastery >= 60
                            ? Colors.primary
                            : exam.mastery >= 40
                            ? Colors.review
                            : Colors.weak,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {!exam.purchased && (
              <View style={styles.lockedSection}>
                <Ionicons name="lock-closed" size={14} color={Colors.textTertiary} />
                <Text style={styles.lockedText}>購買後即可開始練習</Text>
              </View>
            )}

            {exam.purchased && exam.mastery === 0 && (
              <View style={styles.lockedSection}>
                <Ionicons name="play-circle" size={14} color={Colors.primary} />
                <Text style={[styles.lockedText, { color: Colors.primary }]}>
                  點擊開始學習
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Coming Soon */}
        <View style={styles.comingSoonCard}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.textTertiary} />
          <Text style={styles.comingSoonTitle}>更多考試即將推出</Text>
          <Text style={styles.comingSoonText}>
            我們正在準備更多國家的考試模組，敬請期待！
          </Text>
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
  },
  screenSubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  examCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  examTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examFlag: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  examQuestions: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  priceText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  masterySection: {
    marginTop: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  masteryLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  masteryPercent: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  masteryBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  masteryBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  lockedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  lockedText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  comingSoonCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  comingSoonTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  comingSoonText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
