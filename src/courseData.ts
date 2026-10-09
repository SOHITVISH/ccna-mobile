import { ccnpLessonContent, ccnpQuizBank } from "./ccnpContent";
import { lessonContent as ccnaLessonContent } from "./lessonContent";
import { quizBank as ccnaQuizBank } from "./quizBank";

export const lessonContent = { ...ccnaLessonContent, ...ccnpLessonContent };
export const quizBank = { ...ccnaQuizBank, ...ccnpQuizBank };
