import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { answerIsCorrect } from "./assessmentEngine";
import { assessmentBank } from "./assessmentBank";
import { topicById } from "./curriculum";
import type { AssessmentQuestion } from "./assessmentTypes";
import { colors } from "./theme";

type Props = {
  topicId: string;
  onBack: () => void;
};

export function TopicQuestionSetScreen({ topicId, onBack }: Props) {
  const topic = topicById(topicId);
  const questions = assessmentBank[topicId] ?? [];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);
  const question = questions[questionIndex];

  if (!topic) {
    return (
      <View style={styles.screen}>
        <Header onBack={onBack} />
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>Question set unavailable</Text>
          <Text style={styles.copy}>This topic does not have a complete quiz bank yet. Your lesson progress is unchanged.</Text>
        </View>
      </View>
    );
  }

  const complete = questionIndex >= questions.length;
  if (complete) {
    const correctCount = scores.filter(Boolean).length;
    return (
      <View style={styles.screen}>
        <Header onBack={onBack} />
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{correctCount}/{questions.length}</Text>
            <Text style={styles.scoreLabel}>CORRECT</Text>
          </View>
          <Text style={styles.title}>{correctCount === questions.length ? "Perfect recall." : "Practice makes progress."}</Text>
          <Text style={styles.copy}>{topic.title}: review the lesson concepts, then try this topic quiz again when you are ready.</Text>
          <Pressable style={styles.primaryButton} onPress={() => {
            setQuestionIndex(0);
            setSelectedIds([]);
            setSubmitted(false);
            setScores([]);
          }}>
            <Text style={styles.primaryText}>Retry all {questions.length} questions</Text>
            <Ionicons name="refresh" size={17} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onBack}>
            <Text style={styles.secondaryText}>Return to lesson</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.screen}>
        <Header onBack={onBack} />
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>Question set unavailable</Text>
          <Text style={styles.copy}>This topic does not have a question at this position. Your lesson progress is unchanged.</Text>
        </View>
      </View>
    );
  }

  const options = question.type === "ordering" ? question.items : question.options;
  const correctIds = question.type === "ordering" ? question.correctOrder : question.answerIds;
  const isMulti = question.type === "multi-select"
    || (question.type === "simlet" && question.answerIds.length > 1);

  function toggleOption(optionId: string) {
    if (submitted) return;
    if (question.type === "single" || (question.type === "simlet" && question.answerIds.length === 1)) {
      setSelectedIds((current) => current[0] === optionId ? [] : [optionId]);
      return;
    }
    setSelectedIds((current) => current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId]);
  }

  function moveChoice(index: number, direction: -1 | 1) {
    setSelectedIds((current) => {
      const next = [...current];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= next.length) return current;
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function checkAnswer() {
    if (!question || submitted) return;
    setScores((current) => [...current, answerIsCorrect(question, selectedIds)]);
    setSubmitted(true);
  }

  function advance() {
    if (!submitted) return;
    setQuestionIndex((current) => current + 1);
    setSelectedIds([]);
    setSubmitted(false);
  }

  return (
    <View style={styles.screen}>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.domainPill, { backgroundColor: `${topic.domainColor}15` }]}>
          <View style={[styles.domainDot, { backgroundColor: topic.domainColor }]} />
          <Text style={[styles.domainText, { color: topic.domainColor }]}>{topic.domainTitle.toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{topic.title}</Text>
        <Text style={styles.progressLabel}>QUESTION {questionIndex + 1} OF {questions.length}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(questionIndex / questions.length) * 100}%` }]} />
        </View>
        <View style={styles.questionMeta}>
          <Text style={styles.typeLabel}>{typeLabel(question)}</Text>
          <Text style={styles.copySmall}>{scores.filter(Boolean).length} correct so far</Text>
        </View>
        {question.type === "simlet" && (
          <View style={styles.outputPanel}>
            <Text style={styles.outputLabel}>ILLUSTRATIVE OUTPUT</Text>
            <Text selectable style={styles.outputText}>{question.output}</Text>
          </View>
        )}
        <Text style={styles.prompt}>{question.prompt}</Text>
        <Text style={styles.instruction}>{question.type === "ordering"
          ? "Select the steps in order. Use the arrows to adjust your sequence."
          : isMulti ? "Choose all correct answers." : "Choose one answer."}</Text>
        {question.type === "ordering" && selectedIds.length > 0 && (
          <View style={styles.orderPanel}>
            <Text style={styles.outputLabel}>YOUR ORDER</Text>
            {selectedIds.map((id, index) => {
              const item = options.find((option) => option.id === id);
              if (!item) return null;
              return (
                <View key={id} style={styles.orderRow}>
                  <Text style={styles.orderNumber}>{index + 1}</Text>
                  <Text style={styles.orderText}>{item.text}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Move ${item.text} up`} disabled={submitted || index === 0} onPress={() => moveChoice(index, -1)}>
                    <Ionicons name="chevron-up" size={19} color={index === 0 ? "#B8C1CF" : colors.blue} />
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Move ${item.text} down`} disabled={submitted || index === selectedIds.length - 1} onPress={() => moveChoice(index, 1)}>
                    <Ionicons name="chevron-down" size={19} color={index === selectedIds.length - 1 ? "#B8C1CF" : colors.blue} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
        {options.map((option, index) => {
          const selected = selectedIds.includes(option.id);
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: submitted }}
              disabled={submitted}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => question.type === "ordering"
                ? setSelectedIds((current) => current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id])
                : toggleOption(option.id)}
            >
              <View style={[styles.optionMark, selected && styles.optionMarkSelected]}>
                <Text style={[styles.optionMarkText, selected && styles.optionMarkTextSelected]}>{question.type === "ordering" ? String.fromCharCode(65 + index) : isMulti ? (selected ? "✓" : "□") : String.fromCharCode(65 + index)}</Text>
              </View>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.text}</Text>
              {submitted && (
                <Ionicons
                  name={question.type === "ordering"
                    ? selectedIds[question.correctOrder.indexOf(option.id)] === option.id ? "checkmark-circle" : "help-circle"
                    : correctIds.includes(option.id) ? "checkmark-circle" : "close-circle"}
                  size={17}
                  color={question.type === "ordering"
                    ? selectedIds[question.correctOrder.indexOf(option.id)] === option.id ? colors.green : "#A3ADBA"
                    : correctIds.includes(option.id) ? colors.green : "#A3ADBA"}
                />
              )}
            </Pressable>
          );
        })}
        {submitted && (
          <View style={[styles.feedback, answerIsCorrect(question, selectedIds) ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={styles.feedbackTitle}>{answerIsCorrect(question, selectedIds) ? "Correct" : "Review the reasoning"}</Text>
            {options.map((option) => (
              <View key={`${question.id}-${option.id}-explanation`} style={styles.rationale}>
                <Text style={styles.rationaleTitle}>{option.text}</Text>
                <Text style={styles.rationaleText}>{option.explanation}</Text>
              </View>
            ))}
          </View>
        )}
        <Pressable style={[styles.primaryButton, !submitted && styles.checkButton]} onPress={submitted ? advance : checkAnswer}>
          <Text style={styles.primaryText}>{submitted ? questionIndex === questions.length - 1 ? "See quiz result" : "Next question" : "Check answer"}</Text>
          <Ionicons name={submitted ? "arrow-forward" : "checkmark"} size={17} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryText}>Return to lesson</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Return to lesson" style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={colors.ink} />
      </Pressable>
      <View>
        <Text style={styles.headerTitle}>Topic question set</Text>
        <Text style={styles.headerSubtitle}>Original practice · explanations for every option</Text>
      </View>
    </View>
  );
}

function typeLabel(question: AssessmentQuestion): string {
  if (question.type === "multi-select") return "MULTI-SELECT";
  if (question.type === "ordering") return "ORDERING";
  if (question.type === "simlet") return "READ THE OUTPUT";
  return "SINGLE CHOICE";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: "#FFFFFF" },
  backButton: { width: 35, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  headerSubtitle: { color: colors.muted, fontSize: 8, marginTop: 4 },
  content: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 34 },
  domainPill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  domainDot: { width: 7, height: 7, borderRadius: 4 },
  domainText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  title: { color: colors.ink, fontSize: 23, lineHeight: 29, fontWeight: "800", marginTop: 12 },
  progressLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.6, marginTop: 17 },
  progressTrack: { height: 4, borderRadius: 4, backgroundColor: "#E8EDF5", marginTop: 7 },
  progressFill: { height: 4, borderRadius: 4, backgroundColor: colors.blue },
  questionMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 17 },
  typeLabel: { color: colors.blue, fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  copySmall: { color: colors.muted, fontSize: 8 },
  prompt: { color: colors.ink, fontSize: 18, lineHeight: 25, fontWeight: "800", marginTop: 10 },
  instruction: { color: colors.muted, fontSize: 9, marginTop: 5, marginBottom: 8 },
  option: { minHeight: 49, flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderColor: colors.line, backgroundColor: "#FFFFFF", borderRadius: 11, paddingHorizontal: 10, paddingVertical: 8, marginTop: 7 },
  optionSelected: { borderColor: "#8EAFF0", backgroundColor: "#F3F7FF" },
  optionMark: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F3F7" },
  optionMarkSelected: { backgroundColor: colors.blue },
  optionMarkText: { color: "#768398", fontSize: 9, fontWeight: "900" },
  optionMarkTextSelected: { color: "#FFFFFF" },
  optionText: { flex: 1, color: "#536176", fontSize: 9, lineHeight: 14 },
  optionTextSelected: { color: colors.ink, fontWeight: "700" },
  outputPanel: { backgroundColor: "#17263A", borderRadius: 11, padding: 12, marginTop: 14 },
  outputLabel: { color: "#92B5EC", fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginBottom: 8 },
  outputText: { color: "#E1EAF7", fontSize: 9, lineHeight: 15, fontFamily: "monospace" },
  orderPanel: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 10, marginTop: 10 },
  orderRow: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, borderTopColor: "#EDF0F5" },
  orderNumber: { width: 18, color: colors.blue, fontSize: 9, fontWeight: "900" },
  orderText: { flex: 1, color: colors.ink, fontSize: 9 },
  feedback: { borderRadius: 10, padding: 11, marginTop: 11 },
  feedbackCorrect: { backgroundColor: "#EFF8F2" },
  feedbackIncorrect: { backgroundColor: "#FFF6E8" },
  feedbackTitle: { color: colors.ink, fontSize: 10, fontWeight: "900" },
  rationale: { borderTopWidth: 1, borderTopColor: "#DDE4EA", paddingTop: 7, marginTop: 7 },
  rationaleTitle: { color: colors.ink, fontSize: 8, fontWeight: "800" },
  rationaleText: { color: "#647287", fontSize: 8, lineHeight: 12, marginTop: 3 },
  primaryButton: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 11, backgroundColor: colors.blue, paddingHorizontal: 14, marginTop: 14 },
  checkButton: { backgroundColor: colors.green },
  primaryText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  secondaryButton: { alignSelf: "center", padding: 12 },
  secondaryText: { color: colors.blue, fontSize: 9, fontWeight: "800" },
  resultContent: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 22, paddingTop: 28, paddingBottom: 35 },
  scoreCircle: { width: 116, height: 116, alignSelf: "center", borderRadius: 58, backgroundColor: colors.paleBlue, borderWidth: 6, borderColor: "#D7E4FD", alignItems: "center", justifyContent: "center" },
  scoreValue: { color: colors.blue, fontSize: 26, fontWeight: "900" },
  scoreLabel: { color: "#647A9D", fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  copy: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 8, textAlign: "center" },
  errorPanel: { padding: 22 },
  errorTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
});
