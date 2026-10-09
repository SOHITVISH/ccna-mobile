import type { Domain } from "./curriculum";
import type { AssessmentBank, AssessmentOption, AssessmentQuestion } from "./assessmentTypes";

const QUESTION_TYPE_COUNTS = {
  single: 4,
  "multi-select": 2,
  ordering: 1,
  simlet: 1,
} as const;

export function validateAssessmentBank(bank: AssessmentBank, domains: Domain[]): string[] {
  const errors: string[] = [];
  const topics = domains.flatMap((domain) => domain.topics);
  const topicIds = new Set(topics.map(({ id }) => id));
  const questionIds = new Set<string>();

  topics.forEach((topic) => {
    const questions = bank[topic.id];
    if (!questions || questions.length < 8) {
      errors.push(`${topic.id} has ${questions?.length ?? 0} questions; at least 8 are required.`);
      return;
    }
    const typeCounts = new Map<string, number>();
    const prompts = new Set<string>();
    questions.forEach((question, index) => {
      typeCounts.set(question.type, (typeCounts.get(question.type) ?? 0) + 1);
      const normalizedPrompt = question.prompt.trim().toLowerCase();
      if (prompts.has(normalizedPrompt)) errors.push(`${topic.id} repeats a question prompt.`);
      prompts.add(normalizedPrompt);
      errors.push(...validateQuestion(question, topic.id, questionIds, `questions[${index}]`));
    });
    Object.entries(QUESTION_TYPE_COUNTS).forEach(([type, expected]) => {
      if ((typeCounts.get(type) ?? 0) !== expected) {
        errors.push(`${topic.id} must have ${expected} ${type} question(s).`);
      }
    });
  });

  Object.keys(bank).forEach((topicId) => {
    if (!topicIds.has(topicId)) errors.push(`Question bank references unknown topic ${topicId}.`);
  });
  return errors;
}

function validateQuestion(
  question: AssessmentQuestion,
  expectedTopicId: string,
  questionIds: Set<string>,
  path: string,
): string[] {
  const errors: string[] = [];
  if (question.topicId !== expectedTopicId) {
    errors.push(`${path} topicId ${question.topicId} does not match ${expectedTopicId}.`);
  }
  if (!question.id.trim()) errors.push(`${path} has an empty question ID.`);
  if (questionIds.has(question.id)) errors.push(`Duplicate question ID ${question.id}.`);
  questionIds.add(question.id);
  if (!question.prompt.trim()) errors.push(`${question.id} has an empty prompt.`);

  const options = question.type === "ordering" ? question.items : question.options;
  if (options.length !== 4) errors.push(`${question.id} must have exactly four options/items.`);
  const optionIds = new Set<string>();
  const optionTexts = new Set<string>();
  options.forEach((option, index) => {
    const normalizedText = option.text.trim();
    if (optionTexts.has(normalizedText)) errors.push(`${question.id} repeats option text.`);
    optionTexts.add(normalizedText);
    errors.push(...validateOption(option, question.id, optionIds, index));
  });

  if (question.type === "ordering") {
    if (question.correctOrder.length !== 4 || !sameSet(question.correctOrder, [...optionIds])) {
      errors.push(`${question.id} ordering key must contain each item ID exactly once.`);
    }
  } else {
    if (question.answerIds.length === 0 || !sameSet(question.answerIds, [...new Set(question.answerIds)])) {
      errors.push(`${question.id} answer key must contain unique option IDs.`);
    }
    if (question.type === "single" && question.answerIds.length !== 1) {
      errors.push(`${question.id} single-choice key must contain exactly one answer ID.`);
    }
    if ((question.type === "multi-select" || question.type === "simlet") && question.answerIds.length !== 2) {
      errors.push(`${question.id} must have exactly two correct answers.`);
    }
    if (!question.answerIds.every((id) => optionIds.has(id))) {
      errors.push(`${question.id} answer key references an unknown option ID.`);
    }
    if (question.type === "simlet" && !question.output.trim()) {
      errors.push(`${question.id} simlet is missing its illustrative output.`);
    }
  }
  return errors;
}

function validateOption(
  option: AssessmentOption,
  questionId: string,
  optionIds: Set<string>,
  index: number,
): string[] {
  const errors: string[] = [];
  if (!option.id.trim()) errors.push(`${questionId} option ${index + 1} has an empty ID.`);
  if (optionIds.has(option.id)) errors.push(`${questionId} has duplicate option ID ${option.id}.`);
  optionIds.add(option.id);
  if (!option.text.trim()) errors.push(`${questionId} option ${option.id} has no text.`);
  if (!option.explanation.trim()) errors.push(`${questionId} option ${option.id} has no rationale.`);
  return errors;
}

function sameSet(left: string[], right: string[]): boolean {
  return left.length === right.length
    && new Set(left).size === left.length
    && left.every((value) => right.includes(value));
}
