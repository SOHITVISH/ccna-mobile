import { describe, expect, it } from "vitest";
import { answerIsCorrect, examDurationSeconds, examQuestionCount, scoreByDomain, selectExamQuestions } from "./assessmentEngine";
import type { AssessmentBank, AssessmentQuestion } from "./assessmentTypes";
import type { Domain } from "./curriculum";

function makeQuestion(topicId: string, number: number): AssessmentQuestion {
  return {
    id: `${topicId}-q${number}`,
    topicId,
    type: "single",
    prompt: `Question ${number} for ${topicId}?`,
    options: [
      { id: "a", text: "Option A", explanation: "A is the correct protocol behavior." },
      { id: "b", text: "Option B", explanation: "B does not match the stated behavior." },
      { id: "c", text: "Option C", explanation: "C describes a different layer." },
      { id: "d", text: "Option D", explanation: "D is unrelated to this scenario." },
    ],
    answerIds: ["a"],
  };
}

function makeDomain(id: string, weight: number, topicIds: string[], exam: Domain["exam"] = "CCNA"): Domain {
  return {
    id,
    title: `Domain ${id}`,
    weight,
    color: "#3978F6",
    icon: "globe-outline",
    exam,
    topics: topicIds.map((topicId) => ({
      id: topicId,
      title: `Topic ${topicId}`,
      explanation: "A test topic.",
      example: "A test example.",
    })),
  };
}

function makeBank(topicIds: string[], perTopic: number): AssessmentBank {
  return Object.fromEntries(topicIds.map((topicId) => [
    topicId,
    Array.from({ length: perTopic }, (_, index) => makeQuestion(topicId, index + 1)),
  ]));
}

describe("assessment answer scoring", () => {
  it("requires all and only the correct multi-select answers", () => {
    const question: AssessmentQuestion = {
      id: "multi",
      topicId: "topic",
      type: "multi-select",
      prompt: "Select both valid answers.",
      options: [
        { id: "a", text: "A", explanation: "Correct." },
        { id: "b", text: "B", explanation: "Incorrect." },
        { id: "c", text: "C", explanation: "Correct." },
        { id: "d", text: "D", explanation: "Incorrect." },
      ],
      answerIds: ["a", "c"],
    };
    expect(answerIsCorrect(question, ["c", "a"])).toBe(true);
    expect(answerIsCorrect(question, ["a"])).toBe(false);
    expect(answerIsCorrect(question, ["a", "c", "b"])).toBe(false);
  });

  it("scores ordering only when every item is in the correct position", () => {
    const question: AssessmentQuestion = {
      id: "order",
      topicId: "topic",
      type: "ordering",
      prompt: "Order the steps.",
      items: [
        { id: "a", text: "A", explanation: "First." },
        { id: "b", text: "B", explanation: "Second." },
        { id: "c", text: "C", explanation: "Third." },
        { id: "d", text: "D", explanation: "Fourth." },
      ],
      correctOrder: ["a", "b", "c", "d"],
    };
    expect(answerIsCorrect(question, ["a", "b", "c", "d"])).toBe(true);
    expect(answerIsCorrect(question, ["b", "a", "c", "d"])).toBe(false);
  });
});

describe("blueprint exam selection", () => {
  it("uses weighted domain allocation and returns unique questions", () => {
    const domains = [
      makeDomain("large", 75, ["l1", "l2"]),
      makeDomain("small", 25, ["s1", "s2"]),
    ];
    const bank = makeBank(["l1", "l2", "s1", "s2"], 20);
    const questions = selectExamQuestions(domains, bank, "CCNA", "quick", 12, [], () => 0);
    expect(questions).toHaveLength(12);
    expect(new Set(questions.map(({ id }) => id)).size).toBe(12);
    expect(questions.filter(({ domainId }) => domainId === "large")).toHaveLength(9);
    expect(questions.filter(({ domainId }) => domainId === "small")).toHaveLength(3);
  });

  it("uses largest remainders for 12-question CCNA blueprint allocation", () => {
    const domainSpecs: [string, number, number][] = [
      ["fundamentals", 20, 12],
      ["access", 20, 9],
      ["connectivity", 25, 5],
      ["services", 10, 7],
      ["security", 15, 8],
      ["automation", 10, 7],
    ];
    const topicIds = domainSpecs.flatMap(([, , topicCount], index) =>
      Array.from({ length: topicCount }, (_, topicIndex) => `d${index}-t${topicIndex}`)
    );
    const domains = domainSpecs.map(([id, weight, topicCount], index) =>
      makeDomain(id, weight, topicIds.slice(
        domainSpecs.slice(0, index).reduce((sum, [, , previousTopicCount]) => sum + previousTopicCount, 0),
        domainSpecs.slice(0, index + 1).reduce((sum, [, , previousTopicCount]) => sum + previousTopicCount, 0)
      ))
    );
    const bank = makeBank(topicIds, 8);
    const questions = selectExamQuestions(domains, bank, "CCNA", "quick", 12, [], () => 0);
    const counts = Object.fromEntries(domains.map((domain) => [
      domain.id,
      questions.filter((question) => question.domainId === domain.id).length,
    ]));
    expect(counts).toEqual({
      fundamentals: 3,
      access: 2,
      connectivity: 3,
      services: 1,
      security: 2,
      automation: 1,
    });
  });

  it("uses every unseen item before repeating a question after the bank is nearly exhausted", () => {
    const domains = [makeDomain("only", 100, ["one", "two"])];
    const bank = makeBank(["one", "two"], 7);
    const first = selectExamQuestions(domains, bank, "CCNA", "quick", 12, [], () => 0);
    const firstIds = first.map(({ id }) => id);
    const second = selectExamQuestions(domains, bank, "CCNA", "quick", 12, firstIds, () => 0);
    expect(second).toHaveLength(12);
    expect(new Set(second.map(({ id }) => id)).size).toBe(12);
    const unseenIds = Object.values(bank).flat().map(({ id }) => id).filter((id) => !firstIds.includes(id));
    expect(second.map(({ id }) => id)).toEqual(expect.arrayContaining(unseenIds));
    const allSeenIds = [...new Set([...firstIds, ...second.map(({ id }) => id)])];
    const nextCycle = selectExamQuestions(domains, bank, "CCNA", "quick", 12, allSeenIds, () => 0);
    expect(new Set(nextCycle.map(({ id }) => id)).size).toBe(12);
  });

  it("selects only the requested domain and scores results by blueprint weights", () => {
    const domains = [
      makeDomain("a", 75, ["a"]),
      makeDomain("b", 25, ["b"]),
    ];
    const bank = makeBank(["a", "b"], 12);
    const questions = selectExamQuestions(domains, bank, "CCNA", "domain", 12, [], () => 0, "b");
    expect(questions.every(({ domainId }) => domainId === "b")).toBe(true);
    expect(examQuestionCount("full", "CCNA")).toBe(100);
    expect(examQuestionCount("full", "ENCOR")).toBe(80);
    expect(examDurationSeconds("full", "ENARSI")).toBe(7200);
    expect(scoreByDomain(questions, questions.map((_, index) => index === 0 ? [] : ["a"])))
      .toEqual([{ domainId: "b", domainTitle: "Domain b", domainColor: "#3978F6", score: 92, correct: 11, total: 12, weight: 1 }]);
  });

  it("keeps ENCOR and ENARSI question pools separate", () => {
    const domains = [
      makeDomain("encor-domain", 100, ["encor-topic"], "ENCOR"),
      makeDomain("enarsi-domain", 100, ["enarsi-topic"], "ENARSI"),
    ];
    const bank = makeBank(["encor-topic", "enarsi-topic"], 100);
    const questions = selectExamQuestions(domains, bank, "ENARSI", "full", 80);
    expect(questions).toHaveLength(80);
    expect(questions.every(({ domainId }) => domainId === "enarsi-domain")).toBe(true);
  });
});
