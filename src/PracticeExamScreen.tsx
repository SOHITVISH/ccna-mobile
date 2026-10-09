import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { allDomains, type Domain } from "./curriculum";
import {
  answerIsCorrect,
  BLUEPRINT_VERSIONS,
  examDurationSeconds,
  examQuestionCount,
  scoreByDomain,
  selectExamQuestions,
  type ExamQuestion,
} from "./assessmentEngine";
import { assessmentBank } from "./assessmentBank";
import type { ExamBlueprint, ExamMode } from "./assessmentTypes";
import { colors } from "./theme";

const ROTATION_KEY = "packetpath.examRotation.v1";
const ACTIVE_ATTEMPT_KEY = "packetpath.examAttempt.v1";

type ActiveAttempt = {
  blueprint: ExamBlueprint;
  blueprintVersion: string;
  mode: ExamMode;
  domainId?: string;
  questionIds: string[];
  answers: Record<string, string[]>;
  flaggedIds: string[];
  currentIndex: number;
  secondsLeft: number;
  paused: boolean;
  submitted: boolean;
};

type Props = {
  track: "CCNA" | "CCNP Enterprise";
  onExit: () => void;
  onResult: (score: number) => void;
  bestScore: number | null;
  onOpenTopic: (topicId: string) => void;
};

const blueprintLabels: Record<ExamBlueprint, string> = {
  CCNA: "CCNA 200-301",
  ENCOR: "ENCOR 350-401",
  ENARSI: "ENARSI 300-410",
};

function isBlueprint(value: unknown): value is ExamBlueprint {
  return value === "CCNA" || value === "ENCOR" || value === "ENARSI";
}

function isMode(value: unknown): value is ExamMode {
  return value === "quick" || value === "domain" || value === "full";
}

function isActiveAttempt(value: unknown): value is ActiveAttempt {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const validAnswers = typeof record.answers === "object"
    && record.answers !== null
    && Object.values(record.answers).every((answer) =>
      Array.isArray(answer) && answer.every((id) => typeof id === "string")
    );
  return isBlueprint(record.blueprint)
    && typeof record.blueprintVersion === "string"
    && record.blueprintVersion.trim().length > 0
    && isMode(record.mode)
    && Array.isArray(record.questionIds)
    && record.questionIds.length > 0
    && record.questionIds.every((id) => typeof id === "string")
    && validAnswers
    && Array.isArray(record.flaggedIds)
    && record.flaggedIds.every((id) => typeof id === "string")
    && Number.isInteger(record.currentIndex)
    && (record.currentIndex as number) >= 0
    && (record.currentIndex as number) < record.questionIds.length
    && Number.isInteger(record.secondsLeft)
    && (record.secondsLeft as number) >= 0
    && (record.domainId === undefined || typeof record.domainId === "string")
    && typeof record.paused === "boolean"
    && typeof record.submitted === "boolean";
}

function isRestorableAttempt(value: unknown, questionById: Map<string, ExamQuestion>): value is ActiveAttempt {
  if (!isActiveAttempt(value) || !value.questionIds.every((id) => questionById.has(id))) return false;
  const questionIds = new Set(value.questionIds);
  if (questionIds.size !== value.questionIds.length) return false;
  if (!value.questionIds.every((id) => {
    const question = questionById.get(id);
    const domain = allDomains.find((item) => item.id === question?.domainId);
    return domain !== undefined
      && questionMatchesBlueprint(domain, value.blueprint)
      && (value.mode !== "domain" || question?.domainId === value.domainId);
  })) return false;
  if (!value.flaggedIds.every((id) => questionIds.has(id))) return false;
  for (const [questionId, selectedIds] of Object.entries(value.answers)) {
    const question = questionById.get(questionId);
    if (!question || !questionIds.has(questionId) || new Set(selectedIds).size !== selectedIds.length) return false;
    const options = question.type === "ordering" ? question.items : question.options;
    if (!selectedIds.every((id) => options.some((option) => option.id === id))) return false;
    if (question.type === "single" && selectedIds.length > 1) return false;
  }
  if (value.mode === "domain") {
    const domain = allDomains.find((item) => item.id === value.domainId);
    if (!domain || !questionMatchesBlueprint(domain, value.blueprint)) return false;
  }
  return value.questionIds.length === examQuestionCount(value.mode, value.blueprint)
    && value.secondsLeft <= examDurationSeconds(value.mode, value.blueprint);
}

function isRotation(value: unknown): value is Record<string, string[]> {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && Object.values(value).every((ids) => Array.isArray(ids) && ids.every((id) => typeof id === "string"));
}

function questionMatchesBlueprint(domain: Domain, blueprint: ExamBlueprint): boolean {
  return (domain.exam ?? "CCNA") === blueprint;
}

function weightedScore(scores: ReturnType<typeof scoreByDomain>): number {
  return Math.round(scores.reduce((sum, item) => sum + item.score * item.weight, 0));
}

export function PracticeExamScreen({ track, onExit, onResult, bestScore, onOpenTopic }: Props) {
  const [mode, setMode] = useState<ExamMode>("quick");
  const [blueprint, setBlueprint] = useState<ExamBlueprint>(track === "CCNA" ? "CCNA" : "ENCOR");
  const [domainId, setDomainId] = useState<string>();
  const [attempt, setAttempt] = useState<ActiveAttempt | null>(null);
  const [rotation, setRotation] = useState<Record<string, string[]>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<string>();
  const [invalidSavedData, setInvalidSavedData] = useState(false);
  const [selectionError, setSelectionError] = useState<string>();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const reportedResult = useRef(false);
  const lastSavedInteraction = useRef("");

  const questionById = useMemo(() => {
    const result = new Map<string, ExamQuestion>();
    allDomains.forEach((domain) => domain.topics.forEach((topic) => {
      (assessmentBank[topic.id] ?? []).forEach((question) => {
        result.set(question.id, {
          ...question,
          topicTitle: topic.title,
          domainId: domain.id,
          domainTitle: domain.title,
          domainColor: domain.color,
          domainWeight: domain.weight,
        });
      });
    }));
    return result;
  }, []);
  const activeQuestions = attempt?.questionIds.map((id) => questionById.get(id)).filter((question): question is ExamQuestion => question !== undefined) ?? [];
  const answers = attempt?.questionIds.map((id) => attempt.answers[id] ?? []) ?? [];
  const scores = scoreByDomain(activeQuestions, answers);
  const finalScore = weightedScore(scores);
  const currentQuestion = attempt ? activeQuestions[attempt.currentIndex] : undefined;
  const selectedBlueprintDomains = allDomains.filter((domain) => questionMatchesBlueprint(domain, blueprint));

  useEffect(() => {
    let mounted = true;
    Promise.all([
      AsyncStorage.getItem(ROTATION_KEY),
      AsyncStorage.getItem(ACTIVE_ATTEMPT_KEY),
    ]).then(([savedRotation, savedAttempt]) => {
      if (!mounted) return;
      if (savedRotation) {
        try {
          const parsed: unknown = JSON.parse(savedRotation);
          if (isRotation(parsed)) setRotation(parsed);
          else throw new Error("The saved question rotation has an invalid shape.");
        } catch (error) {
          setInvalidSavedData(true);
          setStorageError(`Saved exam rotation data could not be read: ${String(error)} It is preserved until you choose to clear the saved exam data.`);
        }
      }
      if (savedAttempt) {
        try {
          const parsed: unknown = JSON.parse(savedAttempt);
          if (!isRestorableAttempt(parsed, questionById)) {
            throw new Error("The saved exam session references invalid data.");
          }
          setAttempt({ ...parsed, paused: true });
          setBlueprint(parsed.blueprint);
          setMode(parsed.mode);
          setDomainId(parsed.domainId);
        } catch (error) {
          setInvalidSavedData(true);
          setStorageError(`A saved exam session could not be restored: ${String(error)} It is preserved until you choose to clear the saved exam data.`);
        }
      }
    }).catch((error: unknown) => {
      if (mounted) {
        setInvalidSavedData(true);
        setStorageError(`Unable to load saved exam data: ${String(error)}. Clear the unreadable exam data before starting another session.`);
      }
    }).finally(() => {
      if (mounted) setStorageReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [questionById]);

  useEffect(() => {
    if (!attempt || attempt.submitted) return;
    const { secondsLeft, ...interactionState } = attempt;
    const interactionKey = JSON.stringify(interactionState);
    if (
      interactionKey === lastSavedInteraction.current
      && !attempt.paused
      && secondsLeft % 15 !== 0
    ) return;
    lastSavedInteraction.current = interactionKey;
    AsyncStorage.setItem(ACTIVE_ATTEMPT_KEY, JSON.stringify(attempt)).catch((error: unknown) => {
      setStorageError(`Unable to save this exam session: ${String(error)}`);
    });
  }, [attempt]);

  useEffect(() => {
    if (!attempt || attempt.paused || attempt.submitted) return;
    const timer = setInterval(() => {
      setAttempt((current) => current && !current.paused && !current.submitted
        ? { ...current, secondsLeft: Math.max(0, current.secondsLeft - 1) }
        : current);
    }, 1000);
    return () => clearInterval(timer);
  }, [attempt?.paused, attempt?.submitted]);

  useEffect(() => {
    if (!attempt || attempt.submitted || attempt.paused || attempt.secondsLeft > 0) return;
    completeExam();
  }, [attempt]);

  function startExam() {
    try {
      const questionCount = examQuestionCount(mode, blueprint);
      const key = rotationKey(blueprint);
      const poolIds = eligibleQuestionIds(blueprint, mode, domainId);
      const previousIds = rotation[key] ?? [];
      const previousSet = new Set(previousIds);
      const hasCompletedRotation = poolIds.length > 0 && poolIds.every((id) => previousSet.has(id));
      const activePreviousIds = hasCompletedRotation
        ? previousIds.filter((id) => !poolIds.includes(id))
        : previousIds;
      if (invalidSavedData) {
        setSelectionError("Clear the unreadable saved exam data before starting a new session.");
        return;
      }
      const selection = selectExamQuestions(
        allDomains,
        assessmentBank,
        blueprint,
        mode,
        questionCount,
        activePreviousIds,
        Math.random,
        mode === "domain" ? domainId : undefined,
      );
      const nextSeen = [...new Set([...activePreviousIds, ...selection.map((question) => question.id)])];
      const nextRotation = { ...rotation, [key]: nextSeen };
      const nextAttempt: ActiveAttempt = {
        blueprint,
        blueprintVersion: BLUEPRINT_VERSIONS[blueprint],
        mode,
        domainId: mode === "domain" ? domainId : undefined,
        questionIds: selection.map((question) => question.id),
        answers: {},
        flaggedIds: [],
        currentIndex: 0,
        secondsLeft: examDurationSeconds(mode, blueprint),
        paused: false,
        submitted: false,
      };
      setSelectionError(undefined);
      setRotation(nextRotation);
      setAttempt(nextAttempt);
      reportedResult.current = false;
      setPaletteOpen(false);
      Promise.all([
        AsyncStorage.setItem(ROTATION_KEY, JSON.stringify(nextRotation)),
        AsyncStorage.setItem(ACTIVE_ATTEMPT_KEY, JSON.stringify(nextAttempt)),
      ]).catch((error: unknown) => {
        setStorageError(`Unable to save the new exam session: ${String(error)}`);
      });
    } catch (error) {
      setSelectionError(error instanceof Error ? error.message : String(error));
    }
  }

  function rotationKey(selectedBlueprint: ExamBlueprint): string {
    return selectedBlueprint;
  }

  function eligibleQuestionIds(selectedBlueprint: ExamBlueprint, selectedMode: ExamMode, selectedDomainId?: string): string[] {
    return allDomains
      .filter((domain) => questionMatchesBlueprint(domain, selectedBlueprint)
        && (selectedMode !== "domain" || domain.id === selectedDomainId))
      .flatMap((domain) => domain.topics.flatMap((topic) => (assessmentBank[topic.id] ?? []).map(({ id }) => id)));
  }

  function completeExam() {
    if (!attempt || attempt.submitted || reportedResult.current) return;
    reportedResult.current = true;
    onResult(finalScore);
    const completedAttempt = { ...attempt, paused: false, submitted: true };
    setAttempt(completedAttempt);
    AsyncStorage.removeItem(ACTIVE_ATTEMPT_KEY).catch((error: unknown) => {
      setStorageError(`Unable to clear the completed exam session: ${String(error)}`);
    });
  }

  function updateAnswer(questionId: string, nextAnswer: string[]) {
    setAttempt((current) => current ? {
      ...current,
      answers: { ...current.answers, [questionId]: nextAnswer },
    } : current);
  }

  function toggleChoice(question: ExamQuestion, optionId: string) {
    if (!attempt) return;
    const selected = attempt.answers[question.id] ?? [];
    if (question.type === "single" || (question.type === "simlet" && question.answerIds.length === 1)) {
      updateAnswer(question.id, selected[0] === optionId ? [] : [optionId]);
      return;
    }
    updateAnswer(question.id, selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId]);
  }

  function moveOrderedChoice(questionId: string, index: number, direction: -1 | 1) {
    if (!attempt) return;
    const order = [...(attempt.answers[questionId] ?? [])];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= order.length) return;
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    updateAnswer(questionId, order);
  }

  async function pauseAndExit() {
    if (!attempt) {
      onExit();
      return;
    }
    const pausedAttempt = { ...attempt, paused: true };
    try {
      await AsyncStorage.setItem(ACTIVE_ATTEMPT_KEY, JSON.stringify(pausedAttempt));
      setAttempt(pausedAttempt);
      onExit();
    } catch (error) {
      setStorageError(`Unable to preserve the paused exam session: ${String(error)}`);
    }
  }

  const timeLabel = attempt
    ? `${Math.floor(attempt.secondsLeft / 60).toString().padStart(2, "0")}:${(attempt.secondsLeft % 60).toString().padStart(2, "0")}`
    : "";

  if (!attempt) {
    return (
      <View style={styles.screen}>
        <Header title="Practice exam" subtitle="Blueprint-aligned study sets · original questions" onExit={onExit} />
        <ScrollView contentContainerStyle={styles.setupContent}>
          <Text style={styles.eyebrow}>CHOOSE YOUR PRACTICE</Text>
          <Text style={styles.title}>Build exam confidence, one decision at a time.</Text>
          <Text style={styles.copy}>Every question is original PacketPath study material. Practice forms do not reproduce Cisco exams.</Text>
          <Text style={styles.sectionLabel}>Certification blueprint</Text>
          <View style={styles.choiceGrid}>
            {(["CCNA", "ENCOR", "ENARSI"] as ExamBlueprint[]).map((item) => (
              <ChoiceButton key={item} selected={blueprint === item} label={blueprintLabels[item]} detail={BLUEPRINT_VERSIONS[item]} onPress={() => {
                setBlueprint(item);
                setDomainId(undefined);
                setSelectionError(undefined);
              }} />
            ))}
          </View>
          <Text style={styles.sectionLabel}>Exam mode</Text>
          <View style={styles.modeList}>
            <ModeButton selected={mode === "quick"} title="Quick practice" detail="12 questions · 15 minutes" onPress={() => setMode("quick")} />
            <ModeButton selected={mode === "domain"} title="Focus on a domain" detail="12 questions · 15 minutes" onPress={() => setMode("domain")} />
            <ModeButton selected={mode === "full"} title="Full-length practice" detail={`${examQuestionCount("full", blueprint)} questions · 120 minutes`} onPress={() => setMode("full")} />
          </View>
          {mode === "domain" && (
            <>
              <Text style={styles.sectionLabel}>Blueprint domain</Text>
              {selectedBlueprintDomains.map((domain) => (
                <ModeButton key={domain.id} selected={domainId === domain.id} title={domain.title} detail={`${domain.weight}% blueprint weight`} onPress={() => setDomainId(domain.id)} />
              ))}
            </>
          )}
          {selectionError && <Text accessibilityRole="alert" style={styles.errorText}>{selectionError}</Text>}
          {storageError && <Text accessibilityRole="alert" style={styles.errorText}>{storageError}</Text>}
          <Pressable
            accessibilityRole="button"
            disabled={!storageReady || invalidSavedData || (mode === "domain" && !domainId)}
            style={[styles.primaryButton, (!storageReady || invalidSavedData || (mode === "domain" && !domainId)) && styles.disabledButton]}
            onPress={startExam}
          >
            <Text style={styles.primaryButtonText}>{storageReady ? "Start practice exam" : "Loading saved progress…"}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
          {invalidSavedData && (
            <Pressable style={styles.secondaryButton} onPress={() => Alert.alert(
              "Clear unreadable exam data?",
              "This removes the saved exam session and question-rotation history on this device. It does not affect lesson progress or notes.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Clear exam data", style: "destructive", onPress: () => {
                  AsyncStorage.multiRemove([ROTATION_KEY, ACTIVE_ATTEMPT_KEY]).then(() => {
                    setRotation({});
                    setAttempt(null);
                    setInvalidSavedData(false);
                    setStorageError(undefined);
                    setSelectionError(undefined);
                  }).catch((error: unknown) => setStorageError(`Unable to clear unreadable exam data: ${String(error)}`));
                } },
              ],
            )}>
              <Text style={styles.secondaryButtonText}>Clear unreadable saved exam data</Text>
            </Pressable>
          )}
          <Text style={styles.disclaimer}>Practice lengths are PacketPath study settings, not a claim about the official number of Cisco exam questions. Blueprint version: {BLUEPRINT_VERSIONS[blueprint]}.</Text>
        </ScrollView>
      </View>
    );
  }

  if (attempt.submitted) {
    const missed = activeQuestions.filter((question, index) => !answerIsCorrect(question, answers[index] ?? []));
    const missedTopics = [...new Map(missed.map((question) => [question.topicId, question])).values()];
    return (
      <View style={styles.screen}>
        <Header title="Exam results" subtitle={`${blueprintLabels[attempt.blueprint]} · blueprint ${attempt.blueprintVersion}`} onExit={onExit} />
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scorePercent}>{finalScore}%</Text>
            <Text style={styles.scoreCaption}>WEIGHTED SCORE</Text>
          </View>
          <Text style={styles.resultTitle}>{finalScore >= 80 ? "Strong work." : "Your next step is clear."}</Text>
          <Text style={styles.resultSubtitle}>{activeQuestions.filter((question, index) => answerIsCorrect(question, answers[index] ?? [])).length} of {activeQuestions.length} correct · Best on this device {Math.max(bestScore ?? 0, finalScore)}%</Text>
          <View style={styles.resultCard}>
            <Text style={styles.sectionLabel}>Blueprint-weighted performance</Text>
            {scores.map((item) => (
              <View key={item.domainId} style={styles.domainScore}>
                <View style={[styles.domainDot, { backgroundColor: item.domainColor }]} />
                <Text style={styles.domainScoreTitle}>{item.domainTitle}</Text>
                <Text style={styles.domainScoreMeta}>{Math.round(item.weight * 100)}% · {item.correct}/{item.total}</Text>
                <Text style={styles.domainScoreValue}>{item.score}%</Text>
              </View>
            ))}
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.sectionLabel}>Review answers</Text>
            {activeQuestions.map((question, index) => (
              <AnswerReview key={question.id} question={question} selectedIds={answers[index] ?? []} />
            ))}
          </View>
          {missedTopics.length > 0 ? (
            <View style={styles.resultCard}>
              <Text style={styles.sectionLabel}>Review lessons to strengthen</Text>
              {missedTopics.map((question) => (
                <Pressable key={question.topicId} style={styles.lessonLink} onPress={() => onOpenTopic(question.topicId)}>
                  <Text style={styles.lessonLinkText}>{question.topicTitle}</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.blue} />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.copy}>Excellent—this set had no missed topics.</Text>
          )}
          <Pressable style={styles.primaryButton} onPress={() => {
            setAttempt(null);
            setSelectionError(undefined);
            reportedResult.current = false;
          }}>
            <Text style={styles.primaryButtonText}>Build another practice set</Text>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onExit}><Text style={styles.secondaryButtonText}>Back to learning</Text></Pressable>
        </ScrollView>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.screen}>
        <Header title="Practice exam" subtitle="Saved session" onExit={pauseAndExit} />
        <View style={styles.errorPanel}>
          <Text style={styles.errorText}>This saved exam references questions that are no longer available. Its data has been preserved. Start a new exam after returning to the setup screen.</Text>
          <Pressable style={styles.secondaryButton} onPress={() => {
            AsyncStorage.removeItem(ACTIVE_ATTEMPT_KEY).then(() => setAttempt(null)).catch((error: unknown) => setStorageError(`Unable to clear the invalid saved attempt: ${String(error)}`));
          }}>
            <Text style={styles.secondaryButtonText}>Clear invalid saved attempt</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentAnswer = attempt.answers[currentQuestion.id] ?? [];
  const isMulti = currentQuestion.type === "multi-select"
    || (currentQuestion.type === "simlet" && currentQuestion.answerIds.length > 1);
  const choices = currentQuestion.type === "ordering" ? currentQuestion.items : currentQuestion.options;

  return (
    <View style={styles.screen}>
      <Header
        title={attempt.paused ? "Exam paused" : "Practice exam"}
        subtitle={`${blueprintLabels[attempt.blueprint]} · ${attempt.mode === "domain" ? currentQuestion.domainTitle : attempt.mode}`}
        onExit={pauseAndExit}
        timer={timeLabel}
      />
      {attempt.paused ? (
        <View style={styles.pausePanel}>
          <View style={styles.pauseIcon}><Ionicons name="pause" size={25} color={colors.blue} /></View>
          <Text style={styles.resultTitle}>Take a moment.</Text>
          <Text style={styles.copy}>Your answers, flags, question order, and remaining time are saved on this device.</Text>
          <Pressable style={styles.primaryButton} onPress={() => setAttempt((current) => current ? { ...current, paused: false } : current)}>
            <Text style={styles.primaryButtonText}>Resume exam</Text>
            <Ionicons name="play" size={17} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.examContent} showsVerticalScrollIndicator={false}>
            <View style={styles.progressRow}>
              <Text style={styles.sectionLabel}>QUESTION {attempt.currentIndex + 1} OF {activeQuestions.length}</Text>
              <Text style={styles.copy}>{Object.keys(attempt.answers).filter((id) => (attempt.answers[id] ?? []).length > 0).length} answered</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${((attempt.currentIndex + 1) / activeQuestions.length) * 100}%` }]} />
            </View>
            <View style={styles.questionMeta}>
              <Text style={[styles.domainPill, { color: currentQuestion.domainColor }]}>{currentQuestion.domainTitle.toUpperCase()}</Text>
              <Text style={styles.questionType}>{questionTypeLabel(currentQuestion)}</Text>
            </View>
            {currentQuestion.type === "simlet" && (
              <View style={styles.outputPanel}>
                <Text style={styles.outputLabel}>ILLUSTRATIVE OUTPUT</Text>
                <Text selectable style={styles.outputText}>{currentQuestion.output}</Text>
              </View>
            )}
            <Text style={styles.questionTitle}>{currentQuestion.prompt}</Text>
            <Text style={styles.copy}>{currentQuestion.type === "ordering"
              ? "Select the steps, then use the arrows to arrange them."
              : isMulti ? "Select every correct answer." : "Choose the best answer."}</Text>
            {currentQuestion.type === "ordering" && currentAnswer.length > 0 && (
              <View style={styles.orderPanel}>
                <Text style={styles.outputLabel}>YOUR ORDER</Text>
                {currentAnswer.map((id, index) => {
                  const item = choices.find((option) => option.id === id);
                  if (!item) return null;
                  return (
                    <View key={id} style={styles.orderRow}>
                      <Text style={styles.orderIndex}>{index + 1}</Text>
                      <Text style={styles.orderText}>{item.text}</Text>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Move ${item.text} up`} disabled={index === 0} onPress={() => moveOrderedChoice(currentQuestion.id, index, -1)}>
                        <Ionicons name="chevron-up" size={19} color={index === 0 ? "#B8C1CF" : colors.blue} />
                      </Pressable>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Move ${item.text} down`} disabled={index === currentAnswer.length - 1} onPress={() => moveOrderedChoice(currentQuestion.id, index, 1)}>
                        <Ionicons name="chevron-down" size={19} color={index === currentAnswer.length - 1 ? "#B8C1CF" : colors.blue} />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
            {choices.map((choice, index) => {
              const selected = currentAnswer.includes(choice.id);
              const ordered = currentQuestion.type === "ordering";
              return (
                <Pressable
                  key={choice.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    if (ordered) {
                      updateAnswer(currentQuestion.id, selected
                        ? currentAnswer.filter((id) => id !== choice.id)
                        : [...currentAnswer, choice.id]);
                    } else {
                      toggleChoice(currentQuestion, choice.id);
                    }
                  }}
                >
                  <View style={[styles.optionMark, selected && styles.optionMarkSelected]}>
                    <Text style={[styles.optionMarkText, selected && styles.optionMarkTextSelected]}>{ordered ? String.fromCharCode(65 + index) : isMulti ? (selected ? "✓" : "□") : String.fromCharCode(65 + index)}</Text>
                  </View>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{choice.text}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={18} color={colors.blue} />}
                </Pressable>
              );
            })}
            <View style={styles.controlRow}>
              <Pressable style={[styles.controlButton, attempt.flaggedIds.includes(currentQuestion.id) && styles.flagActive]} onPress={() => setAttempt((current) => current ? {
                ...current,
                flaggedIds: current.flaggedIds.includes(currentQuestion.id)
                  ? current.flaggedIds.filter((id) => id !== currentQuestion.id)
                  : [...current.flaggedIds, currentQuestion.id],
              } : current)}>
                <Ionicons name={attempt.flaggedIds.includes(currentQuestion.id) ? "flag" : "flag-outline"} size={16} color={attempt.flaggedIds.includes(currentQuestion.id) ? "#C47A23" : colors.blue} />
                <Text style={styles.controlButtonText}>{attempt.flaggedIds.includes(currentQuestion.id) ? "Flagged" : "Flag for review"}</Text>
              </Pressable>
              <Pressable style={styles.controlButton} onPress={() => setPaletteOpen((open) => !open)}>
                <Ionicons name="grid-outline" size={16} color={colors.blue} />
                <Text style={styles.controlButtonText}>{paletteOpen ? "Hide palette" : "Question palette"}</Text>
              </Pressable>
            </View>
            {paletteOpen && (
              <View style={styles.palette}>
                {activeQuestions.map((question, index) => {
                  const answered = (attempt.answers[question.id] ?? []).length > 0;
                  const flagged = attempt.flaggedIds.includes(question.id);
                  return (
                    <Pressable key={question.id} accessibilityRole="button" accessibilityLabel={`Go to question ${index + 1}${answered ? ", answered" : ", unanswered"}${flagged ? ", flagged" : ""}`} onPress={() => setAttempt((current) => current ? { ...current, currentIndex: index } : current)} style={[styles.paletteCell, answered && styles.paletteAnswered, flagged && styles.paletteFlagged, index === attempt.currentIndex && styles.paletteCurrent]}>
                      <Text style={[styles.paletteNumber, (answered || index === attempt.currentIndex) && styles.paletteNumberActive]}>{index + 1}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Pressable style={styles.pauseButton} onPress={() => setAttempt((current) => current ? { ...current, paused: true } : current)}>
              <Ionicons name="pause" size={16} color={colors.blue} />
              <Text style={styles.pauseButtonText}>Pause</Text>
            </Pressable>
            {attempt.currentIndex > 0 && (
              <Pressable style={styles.navButton} onPress={() => setAttempt((current) => current ? { ...current, currentIndex: Math.max(0, current.currentIndex - 1) } : current)}>
                <Text style={styles.navText}>Previous</Text>
              </Pressable>
            )}
            {attempt.currentIndex < activeQuestions.length - 1 ? (
              <Pressable style={styles.primaryButtonCompact} onPress={() => setAttempt((current) => current ? { ...current, currentIndex: Math.min(activeQuestions.length - 1, current.currentIndex + 1) } : current)}>
                <Text style={styles.primaryButtonText}>Next question</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Pressable style={styles.submitButton} onPress={() => Alert.alert("Submit practice exam?", "Unanswered questions will be marked incorrect. You can review every answer on the results screen.", [
                { text: "Keep reviewing", style: "cancel" },
                { text: "Submit", onPress: completeExam },
              ])}>
                <Text style={styles.primaryButtonText}>Submit exam</Text>
                <Ionicons name="checkmark" size={17} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

function Header({ title, subtitle, onExit, timer }: { title: string; subtitle: string; onExit: () => void; timer?: string }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Exit practice exam" style={styles.backButton} onPress={onExit}>
        <Ionicons name="close" size={20} color={colors.ink} />
      </Pressable>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      {timer !== undefined && <View style={styles.timerBadge}><Ionicons name="time-outline" size={15} color={colors.blue} /><Text style={styles.timerText}>{timer}</Text></View>}
    </View>
  );
}

function ChoiceButton({ selected, label, detail, onPress }: { selected: boolean; label: string; detail: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} style={[styles.choiceButton, selected && styles.choiceSelected]} onPress={onPress}>
      <Text style={[styles.choiceTitle, selected && styles.choiceTextSelected]}>{label}</Text>
      <Text style={styles.choiceDetail}>{detail}</Text>
    </Pressable>
  );
}

function ModeButton({ selected, title, detail, onPress }: { selected: boolean; title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} style={[styles.modeButton, selected && styles.modeSelected]} onPress={onPress}>
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
      <View style={styles.modeText}>
        <Text style={styles.modeTitle}>{title}</Text>
        <Text style={styles.modeDetail}>{detail}</Text>
      </View>
    </Pressable>
  );
}

function questionTypeLabel(question: ExamQuestion): string {
  if (question.type === "multi-select") return "MULTI-SELECT";
  if (question.type === "ordering") return "ORDERING";
  if (question.type === "simlet") return "READ THE OUTPUT";
  return "SINGLE CHOICE";
}

function AnswerReview({ question, selectedIds }: { question: ExamQuestion; selectedIds: string[] }) {
  const correct = answerIsCorrect(question, selectedIds);
  const options = question.type === "ordering" ? question.items : question.options;
  const correctIds = question.type === "ordering" ? question.correctOrder : question.answerIds;
  return (
    <View style={styles.reviewQuestion}>
      <View style={styles.reviewHeading}>
        <View style={[styles.domainDot, { backgroundColor: correct ? colors.green : "#C45461" }]} />
        <Text style={styles.reviewTopic}>{question.topicTitle}</Text>
        <Text style={[styles.reviewStatus, { color: correct ? colors.green : "#C45461" }]}>{correct ? "CORRECT" : "REVIEW"}</Text>
      </View>
      {question.type === "simlet" && <Text selectable style={styles.reviewOutput}>{question.output}</Text>}
      <Text style={styles.reviewPrompt}>{question.prompt}</Text>
      {question.type === "ordering" && (
        <Text style={styles.answerLine}>Your order: {selectedIds.map((id) => options.find((option) => option.id === id)?.text ?? "Unknown item").join(" → ") || "Not answered"}</Text>
      )}
      {options.map((option) => (
        <View key={option.id} style={styles.rationaleRow}>
          <Ionicons
            name={question.type === "ordering"
              ? selectedIds[question.correctOrder.indexOf(option.id)] === option.id ? "checkmark-circle" : "ellipse-outline"
              : correctIds.includes(option.id) ? "checkmark-circle" : "close-circle"}
            size={16}
            color={question.type === "ordering"
              ? selectedIds[question.correctOrder.indexOf(option.id)] === option.id ? colors.green : "#9AA4B2"
              : correctIds.includes(option.id) ? colors.green : "#9AA4B2"}
          />
          <View style={styles.rationaleCopy}>
            <Text style={styles.rationaleOption}>{question.type === "ordering" ? `Step ${question.correctOrder.indexOf(option.id) + 1}: ` : ""}{option.text}{selectedIds.includes(option.id) ? " · selected" : ""}</Text>
            <Text style={styles.rationaleText}>{option.explanation}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 17, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: "#FFFFFF" },
  backButton: { width: 34, height: 38, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  headerTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  headerSubtitle: { color: colors.muted, fontSize: 9, marginTop: 4 },
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.paleBlue, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  timerText: { color: colors.blue, fontSize: 10, fontVariant: ["tabular-nums"], fontWeight: "800" },
  setupContent: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 21, paddingTop: 24, paddingBottom: 38 },
  eyebrow: { color: colors.blue, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 24, lineHeight: 31, fontWeight: "800", letterSpacing: -0.5, marginTop: 8 },
  copy: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 7 },
  sectionLabel: { color: colors.ink, fontSize: 10, fontWeight: "900", letterSpacing: 0.6, marginTop: 21, marginBottom: 9 },
  choiceGrid: { gap: 8 },
  choiceButton: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: "#FFFFFF", padding: 12 },
  choiceSelected: { borderColor: colors.blue, backgroundColor: "#F3F7FF" },
  choiceTitle: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  choiceTextSelected: { color: colors.blue },
  choiceDetail: { color: colors.muted, fontSize: 9, marginTop: 4 },
  modeList: { gap: 8 },
  modeButton: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: "#FFFFFF", padding: 12, marginBottom: 7 },
  modeSelected: { borderColor: "#9BB8EE", backgroundColor: "#F7F9FF" },
  radio: { width: 18, height: 18, borderWidth: 1.5, borderColor: "#A7B2C2", borderRadius: 9, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: colors.blue },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
  modeText: { flex: 1 },
  modeTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  modeDetail: { color: colors.muted, fontSize: 8, marginTop: 4 },
  primaryButton: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.blue, borderRadius: 12, paddingHorizontal: 14, marginTop: 20 },
  primaryButtonCompact: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: colors.blue, borderRadius: 11, paddingHorizontal: 13 },
  submitButton: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: colors.green, borderRadius: 11, paddingHorizontal: 13 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  disabledButton: { opacity: 0.55 },
  secondaryButton: { alignSelf: "center", padding: 12 },
  secondaryButtonText: { color: colors.blue, fontSize: 10, fontWeight: "800" },
  disclaimer: { color: "#7B8798", fontSize: 8, lineHeight: 13, marginTop: 18 },
  errorText: { color: "#A33E48", fontSize: 10, lineHeight: 15, backgroundColor: "#FFF0F0", borderRadius: 9, padding: 10, marginTop: 12 },
  errorPanel: { padding: 22 },
  examContent: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 21, paddingTop: 18, paddingBottom: 25 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTrack: { height: 4, borderRadius: 4, backgroundColor: "#E8EDF5", marginTop: 8 },
  progressFill: { height: 4, borderRadius: 4, backgroundColor: colors.blue },
  questionMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 21 },
  domainPill: { fontSize: 8, fontWeight: "900", letterSpacing: 0.7, flexShrink: 1 },
  questionType: { color: "#77849A", fontSize: 8, fontWeight: "900", letterSpacing: 0.5, marginLeft: 9 },
  questionTitle: { color: colors.ink, fontSize: 20, lineHeight: 27, fontWeight: "800", letterSpacing: -0.4, marginTop: 12, marginBottom: 2 },
  option: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9, marginTop: 8 },
  optionSelected: { borderColor: "#8EAFF0", backgroundColor: "#F3F7FF" },
  optionMark: { width: 27, height: 27, borderRadius: 9, backgroundColor: "#F1F3F7", alignItems: "center", justifyContent: "center" },
  optionMarkSelected: { backgroundColor: colors.blue },
  optionMarkText: { color: "#768398", fontSize: 9, fontWeight: "900" },
  optionMarkTextSelected: { color: "#FFFFFF" },
  optionText: { color: "#536176", fontSize: 10, lineHeight: 15, flex: 1 },
  optionTextSelected: { color: colors.ink, fontWeight: "700" },
  outputPanel: { backgroundColor: "#17263A", borderRadius: 11, padding: 12, marginTop: 13 },
  outputLabel: { color: "#92B5EC", fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginBottom: 8 },
  outputText: { color: "#E1EAF7", fontSize: 9, lineHeight: 15, fontFamily: "monospace" },
  orderPanel: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 11, marginTop: 12 },
  orderRow: { minHeight: 35, flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, borderTopColor: "#EDF0F5" },
  orderIndex: { width: 19, color: colors.blue, fontSize: 9, fontWeight: "900" },
  orderText: { flex: 1, color: colors.ink, fontSize: 9 },
  controlRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 11 },
  controlButton: { minHeight: 36, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8 },
  controlButtonText: { color: colors.blue, fontSize: 9, fontWeight: "800" },
  flagActive: { backgroundColor: "#FFF6E8", borderRadius: 8 },
  palette: { flexDirection: "row", flexWrap: "wrap", gap: 7, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 10, marginTop: 7 },
  paletteCell: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  paletteAnswered: { backgroundColor: "#EAF5EF", borderColor: "#B7DEC8" },
  paletteFlagged: { borderColor: "#D79032", borderWidth: 2 },
  paletteCurrent: { backgroundColor: colors.blue, borderColor: colors.blue },
  paletteNumber: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  paletteNumberActive: { color: "#FFFFFF" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5, paddingHorizontal: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "#FFFFFF" },
  pauseButton: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7 },
  pauseButtonText: { color: colors.blue, fontSize: 9, fontWeight: "800" },
  navButton: { paddingHorizontal: 8, paddingVertical: 10 },
  navText: { color: colors.blue, fontSize: 9, fontWeight: "800" },
  pausePanel: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28 },
  pauseIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.paleBlue, alignItems: "center", justifyContent: "center" },
  resultContent: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 20, paddingTop: 22, paddingBottom: 34 },
  scoreCircle: { width: 122, height: 122, borderRadius: 61, alignSelf: "center", backgroundColor: colors.paleBlue, borderWidth: 7, borderColor: "#D7E4FD", alignItems: "center", justifyContent: "center" },
  scorePercent: { color: colors.blue, fontSize: 29, fontWeight: "900" },
  scoreCaption: { color: "#647A9D", fontSize: 7, letterSpacing: 0.7, fontWeight: "900", marginTop: 2 },
  resultTitle: { color: colors.ink, fontSize: 22, textAlign: "center", fontWeight: "800", marginTop: 16 },
  resultSubtitle: { color: colors.muted, fontSize: 9, textAlign: "center", marginTop: 6 },
  resultCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginTop: 13 },
  domainScore: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: 7, borderTopWidth: 1, borderTopColor: "#EDF0F5" },
  domainDot: { width: 7, height: 7, borderRadius: 4 },
  domainScoreTitle: { flex: 1, color: colors.ink, fontSize: 8, fontWeight: "700" },
  domainScoreMeta: { color: colors.muted, fontSize: 8 },
  domainScoreValue: { width: 34, textAlign: "right", color: colors.ink, fontSize: 9, fontWeight: "900" },
  reviewQuestion: { borderTopWidth: 1, borderTopColor: "#EDF0F5", paddingTop: 10, marginTop: 8 },
  reviewHeading: { flexDirection: "row", alignItems: "center", gap: 6 },
  reviewTopic: { flex: 1, color: colors.ink, fontSize: 9, fontWeight: "800" },
  reviewStatus: { fontSize: 7, fontWeight: "900", letterSpacing: 0.5 },
  reviewOutput: { backgroundColor: "#17263A", color: "#E1EAF7", fontFamily: "monospace", fontSize: 8, lineHeight: 13, padding: 8, borderRadius: 7, marginTop: 8 },
  reviewPrompt: { color: colors.ink, fontSize: 9, lineHeight: 14, fontWeight: "700", marginTop: 7 },
  answerLine: { color: colors.muted, fontSize: 8, marginTop: 5 },
  rationaleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, paddingTop: 7 },
  rationaleCopy: { flex: 1 },
  rationaleOption: { color: colors.ink, fontSize: 8, fontWeight: "700" },
  rationaleText: { color: colors.muted, fontSize: 8, lineHeight: 12, marginTop: 2 },
  lessonLink: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#EDF0F5" },
  lessonLinkText: { color: colors.blue, fontSize: 9, fontWeight: "700" },
});
