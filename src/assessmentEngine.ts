import type { Domain } from "./curriculum";
import type {
  AssessmentBank,
  AssessmentQuestion,
  ExamBlueprint,
  ExamMode,
} from "./assessmentTypes";

export type ExamQuestion = AssessmentQuestion & {
  topicTitle: string;
  domainId: string;
  domainTitle: string;
  domainColor: string;
  domainWeight: number;
};

export type DomainExamScore = {
  domainId: string;
  domainTitle: string;
  domainColor: string;
  score: number;
  correct: number;
  total: number;
  weight: number;
};

export const BLUEPRINT_VERSIONS: Record<ExamBlueprint, string> = {
  CCNA: "200-301 v1.1",
  ENCOR: "350-401 v1.1",
  ENARSI: "300-410 v1.1",
};

export function examQuestionCount(mode: ExamMode, blueprint: ExamBlueprint): number {
  if (mode === "quick") return 12;
  if (mode === "domain") return 12;
  return blueprint === "CCNA" ? 100 : 80;
}

export function examDurationSeconds(mode: ExamMode, blueprint: ExamBlueprint): number {
  return mode === "full" ? 120 * 60 : 15 * 60;
}

export function answerIsCorrect(question: AssessmentQuestion, answerIds: string[]): boolean {
  if (question.type === "ordering") {
    return answerIds.length === question.correctOrder.length
      && question.correctOrder.every((id, index) => answerIds[index] === id);
  }
  return sameSet(answerIds, question.answerIds);
}

function sameSet(left: string[], right: string[]): boolean {
  return left.length === right.length
    && new Set(left).size === left.length
    && left.every((id) => right.includes(id));
}

export function selectExamQuestions(
  domains: Domain[],
  bank: AssessmentBank,
  blueprint: ExamBlueprint,
  mode: ExamMode,
  requestedCount: number,
  previouslyUsedIds: string[] = [],
  random: () => number = Math.random,
  selectedDomainId?: string,
): ExamQuestion[] {
  const eligibleDomains = domains.filter((domain) =>
    (domain.exam ?? "CCNA") === blueprint
    && (mode !== "domain" || domain.id === selectedDomainId)
  );
  if (eligibleDomains.length === 0) {
    throw new Error(`No curriculum domains are available for ${blueprint}${selectedDomainId ? ` / ${selectedDomainId}` : ""}.`);
  }

  const domainPools = eligibleDomains.map((domain) => ({
    domain,
    questions: domain.topics.flatMap((topic) => (bank[topic.id] ?? []).map((question) => ({
      ...question,
      topicTitle: topic.title,
      domainId: domain.id,
      domainTitle: domain.title,
      domainColor: domain.color,
      domainWeight: domain.weight,
    }))),
  }));
  const allQuestions = domainPools.flatMap(({ questions }) => questions);
  if (new Set(allQuestions.map(({ id }) => id)).size !== allQuestions.length) {
    throw new Error("Assessment bank contains duplicate question IDs in the selected blueprint.");
  }

  const previouslyUsed = new Set(previouslyUsedIds);
  const unusedPools = domainPools.map((pool) => ({
    ...pool,
    questions: pool.questions.filter(({ id }) => !previouslyUsed.has(id)),
  }));
  const unusedCount = unusedPools.reduce((total, pool) => total + pool.questions.length, 0);
  const allCount = domainPools.reduce((total, pool) => total + pool.questions.length, 0);
  if (requestedCount < 1 || allCount < requestedCount) {
    throw new Error(`Requested ${requestedCount} questions, but only ${allCount} are available for ${blueprint}.`);
  }

  if (unusedCount >= requestedCount) {
    return allocateWeightedQuestions(unusedPools, requestedCount, random);
  }
  const previouslySeenPools = domainPools.map((pool) => ({
    ...pool,
    questions: pool.questions.filter(({ id }) => previouslyUsed.has(id)),
  }));
  const unseenQuestions = shuffle(unusedPools.flatMap((pool) => pool.questions), random);
  const usedQuestions = allocateWeightedQuestions(previouslySeenPools, requestedCount - unusedCount, random);
  return shuffle([...unseenQuestions, ...usedQuestions], random);
}

function allocateWeightedQuestions(
  availablePools: { domain: Domain; questions: ExamQuestion[] }[],
  requestedCount: number,
  random: () => number,
): ExamQuestion[] {
  const counts = new Map(availablePools.map(({ domain }) => [domain.id, 0]));
  let remaining = requestedCount;
  while (remaining > 0) {
    const active = availablePools.filter(({ domain, questions }) =>
      questions.length > (counts.get(domain.id) ?? 0)
    );
    const activeWeight = active.reduce((sum, { domain }) => sum + domain.weight, 0);
    if (activeWeight <= 0) {
      throw new Error("Unable to allocate questions across the selected blueprint domains.");
    }

    const allocation = active.map(({ domain, questions }) => {
      const exact = remaining * domain.weight / activeWeight;
      const capacity = questions.length - (counts.get(domain.id) ?? 0);
      const base = Math.min(Math.floor(exact), capacity);
      return { domainId: domain.id, limit: questions.length, base, remainder: exact - Math.floor(exact) };
    });
    const assigned = allocation.reduce((sum, item) => sum + item.base, 0);
    allocation.forEach(({ domainId, base }) => counts.set(domainId, (counts.get(domainId) ?? 0) + base));
    remaining -= assigned;

    if (remaining > 0) {
      const remainderOrder = allocation
        .filter(({ domainId, limit }) => limit > (counts.get(domainId) ?? 0))
        .sort((left, right) => right.remainder - left.remainder);
      const assignedRemainders = remainderOrder.slice(0, remaining);
      assignedRemainders.forEach(({ domainId }) => {
        counts.set(domainId, (counts.get(domainId) ?? 0) + 1);
      });
      remaining -= assignedRemainders.length;
      if (assigned === 0 && assignedRemainders.length === 0) {
        throw new Error("Unable to fill the requested exam without repeating a question.");
      }
    }
  }

  const selected = availablePools.flatMap(({ domain, questions }) => {
    const shuffled = shuffle([...questions], random);
    return shuffled.slice(0, counts.get(domain.id) ?? 0);
  });
  return shuffle(selected, random);
}

export function scoreByDomain(
  questions: ExamQuestion[],
  answers: string[][],
): DomainExamScore[] {
  const totals = new Map<string, DomainExamScore>();
  questions.forEach((question, index) => {
    const current = totals.get(question.domainId) ?? {
      domainId: question.domainId,
      domainTitle: question.domainTitle,
      domainColor: question.domainColor,
      score: 0,
      correct: 0,
      total: 0,
      weight: question.domainWeight,
    };
    current.total += 1;
    if (answerIsCorrect(question, answers[index] ?? [])) current.correct += 1;
    totals.set(question.domainId, current);
  });
  const results = [...totals.values()];
  const totalWeight = results.reduce((sum, item) => sum + item.weight, 0);
  results.forEach((item) => {
    item.score = item.total === 0 ? 0 : Math.round(item.correct / item.total * 100);
    item.weight = totalWeight === 0 ? 0 : item.weight / totalWeight;
  });
  return results.sort((left, right) => left.score - right.score);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}
