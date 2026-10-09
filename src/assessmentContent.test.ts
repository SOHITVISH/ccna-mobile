import { describe, expect, it } from "vitest";
import { assessmentBank, assessmentQuestions } from "./assessmentBank";
import { allDomains, allTopics } from "./curriculum";
import { validateAssessmentBank } from "./assessmentValidation";

describe("original assessment content", () => {
  it("provides eight valid questions for every CCNA and CCNP topic", () => {
    expect(allTopics).toHaveLength(105);
    expect(assessmentQuestions).toHaveLength(840);
    expect(Object.keys(assessmentBank)).toHaveLength(105);
    expect(validateAssessmentBank(assessmentBank, allDomains)).toEqual([]);
  });
});
