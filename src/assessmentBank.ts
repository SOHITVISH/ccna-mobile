import { allTopics } from "./curriculum";
import { ccnaFoundationsQuestions } from "./questionBank/ccnaFoundations";
import { ccnaRoutingServicesQuestions } from "./questionBank/ccnaRoutingServices";
import { ccnaSecurityAutomationQuestions } from "./questionBank/ccnaSecurityAutomation";
import { encorQuestions } from "./questionBank/encor";
import { enarsiQuestions } from "./questionBank/enarsi";
import type { AssessmentBank, AssessmentQuestion } from "./assessmentTypes";

export const assessmentQuestions: AssessmentQuestion[] = [
  ...ccnaFoundationsQuestions,
  ...ccnaRoutingServicesQuestions,
  ...ccnaSecurityAutomationQuestions,
  ...encorQuestions,
  ...enarsiQuestions,
];

export const assessmentBank: AssessmentBank = assessmentQuestions.reduce<AssessmentBank>((bank, question) => {
  (bank[question.topicId] ??= []).push(question);
  return bank;
}, Object.fromEntries(allTopics.map(({ id }) => [id, []])));
