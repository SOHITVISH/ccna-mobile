export type AssessmentOption = {
  id: string;
  text: string;
  explanation: string;
};

export type AssessmentQuestionBase = {
  id: string;
  topicId: string;
  prompt: string;
};

export type SingleChoiceQuestion = AssessmentQuestionBase & {
  type: "single";
  options: [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
  answerIds: [string];
};

export type MultiSelectQuestion = AssessmentQuestionBase & {
  type: "multi-select";
  options: [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
  answerIds: string[];
};

export type OrderingQuestion = AssessmentQuestionBase & {
  type: "ordering";
  items: [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
  correctOrder: [string, string, string, string];
};

export type SimletQuestion = AssessmentQuestionBase & {
  type: "simlet";
  output: string;
  options: [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
  answerIds: string[];
};

export type AssessmentQuestion =
  | SingleChoiceQuestion
  | MultiSelectQuestion
  | OrderingQuestion
  | SimletQuestion;

export type AssessmentBank = Record<string, AssessmentQuestion[]>;

export type ExamBlueprint = "CCNA" | "ENCOR" | "ENARSI";

export type ExamMode = "quick" | "domain" | "full";
