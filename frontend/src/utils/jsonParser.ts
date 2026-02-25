import { Question, QuestionCategory, DifficultyLevel } from '../backend';

const VALID_CATEGORIES = Object.values(QuestionCategory);
const VALID_DIFFICULTIES = Object.values(DifficultyLevel);

export function parseJSON(text: string): { questions: Question[]; errors: string[] } {
  let data: any[];
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return { questions: [], errors: ['JSON must be an array of question objects'] };
    }
    data = parsed;
  } catch {
    return { questions: [], errors: ['Invalid JSON format'] };
  }

  const questions: Question[] = [];
  const errors: string[] = [];

  data.forEach((item, idx) => {
    const rowNum = idx + 1;
    const rowErrors: string[] = [];

    if (!item.subjectId) rowErrors.push('subjectId is required');
    if (!item.questionText) rowErrors.push('questionText is required');

    if (!VALID_CATEGORIES.includes(item.category)) {
      rowErrors.push(`Invalid category "${item.category}"`);
    }
    if (!VALID_DIFFICULTIES.includes(item.difficultyLevel)) {
      rowErrors.push(`Invalid difficultyLevel "${item.difficultyLevel}"`);
    }

    const isMCQ = item.category === QuestionCategory.mcqOneMark;
    if (isMCQ && (!item.options || item.options.length < 2)) {
      rowErrors.push('MCQ questions require at least 2 options');
    }
    if (isMCQ && !item.correctAnswer) {
      rowErrors.push('MCQ questions require a correctAnswer');
    }

    if (rowErrors.length > 0) {
      errors.push(`Item ${rowNum}: ${rowErrors.join('; ')}`);
      return;
    }

    questions.push({
      id: BigInt(Date.now() + idx),
      subjectId: item.subjectId,
      category: item.category as QuestionCategory,
      questionText: item.questionText,
      options: isMCQ ? item.options : undefined,
      correctAnswer: isMCQ ? item.correctAnswer : undefined,
      difficultyLevel: item.difficultyLevel as DifficultyLevel,
      timestamp: BigInt(Date.now()),
    });
  });

  return { questions, errors };
}
