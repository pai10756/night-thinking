import React, { useState, useEffect, useRef } from 'react';
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
import { practiceQuestion } from '../constants/mockData';

export default function PracticeScreen() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index ? styles.optionSelected : styles.option;
    }
    if (index === practiceQuestion.correctAnswer) {
      return styles.optionCorrect;
    }
    if (selectedAnswer === index && index !== practiceQuestion.correctAnswer) {
      return styles.optionWrong;
    }
    return styles.option;
  };

  const getOptionTextColor = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index ? Colors.primary : Colors.textPrimary;
    }
    if (index === practiceQuestion.correctAnswer) return Colors.correct;
    if (selectedAnswer === index) return Colors.weak;
    return Colors.textSecondary;
  };

  const progress = practiceQuestion.id / practiceQuestion.total;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {practiceQuestion.id}/{practiceQuestion.total}
          </Text>
        </View>
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionMeta}>
            <View style={styles.questionNumberBadge}>
              <Text style={styles.questionNumber}>第 {practiceQuestion.id} 題</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{practiceQuestion.category}</Text>
            </View>
          </View>
          <Text style={styles.questionText}>{practiceQuestion.question}</Text>
        </View>

        {/* Options */}
        {practiceQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleSelectAnswer(index)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.optionLabel,
                {
                  backgroundColor:
                    showResult && index === practiceQuestion.correctAnswer
                      ? Colors.correctLight
                      : showResult && selectedAnswer === index
                      ? Colors.weakLight
                      : selectedAnswer === index
                      ? Colors.primaryLight
                      : Colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionLabelText,
                  { color: getOptionTextColor(index) },
                ]}
              >
                {option.label}
              </Text>
            </View>
            <Text
              style={[
                styles.optionText,
                { color: getOptionTextColor(index) },
              ]}
            >
              {option.text}
            </Text>
            {showResult && index === practiceQuestion.correctAnswer && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.correct}
                style={styles.resultIcon}
              />
            )}
            {showResult &&
              selectedAnswer === index &&
              index !== practiceQuestion.correctAnswer && (
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={Colors.weak}
                  style={styles.resultIcon}
                />
              )}
          </TouchableOpacity>
        ))}

        {/* Explanation */}
        {showResult && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb-outline" size={18} color={Colors.review} />
              <Text style={styles.explanationTitle}>解析</Text>
            </View>
            <Text style={styles.explanationText}>
              {practiceQuestion.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButtonSecondary} onPress={handleReset}>
          <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
          <Text style={styles.navButtonSecondaryText}>上一題</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButtonPrimary} onPress={handleReset}>
          <Text style={styles.navButtonPrimaryText}>下一題</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  progressSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  timerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
  },
  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  questionNumberBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginRight: Spacing.sm,
  },
  questionNumber: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoryBadge: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.secondary,
  },
  questionText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  option: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  optionSelected: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadows.subtle,
  },
  optionCorrect: {
    backgroundColor: Colors.correctLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.correct,
  },
  optionWrong: {
    backgroundColor: Colors.weakLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.weak,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionLabelText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: FontSizes.base,
    fontWeight: '500',
    lineHeight: 22,
  },
  resultIcon: {
    marginLeft: Spacing.sm,
  },
  explanationCard: {
    backgroundColor: Colors.reviewLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  explanationTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  explanationText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  navButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
  },
  navButtonSecondaryText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  navButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
  navButtonPrimaryText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
    marginRight: Spacing.xs,
  },
});
