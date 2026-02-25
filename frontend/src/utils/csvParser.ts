import { Question, QuestionCategory, DifficultyLevel } from '../backend';

const VALID_CATEGORIES = Object.values(QuestionCategory);
const VALID_DIFFICULTIES = Object.values(DifficultyLevel);

const CATEGORY_MARKS: Record<string, number> = {
  [QuestionCategory.mcqOneMark]: 1,
  [QuestionCategory._2Marks]: 2,
  [QuestionCategory._4Marks]: 4,
  [QuestionCategory._6Marks]: 6,
  [QuestionCategory._8Marks]: 8,
};

export function parseCSV(text: string): { questions: Question[]; errors: string[] } {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { questions: [], errors: ['CSV file is empty or has no data rows'] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const required = ['subject', 'category', 'questiontext', 'difficultylevel'];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length > 0) {
    return { questions: [], errors: [`Missing required headers: ${missing.join(', ')}`] };
  }

  const questions: Question[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });

    const rowErrors: string[] = [];

    if (!row['subject']) rowErrors.push('subject is required');
    if (!row['questiontext']) rowErrors.push('questionText is required');

    const category = row['category'];
    if (!VALID_CATEGORIES.includes(category as QuestionCategory)) {
      rowErrors.push(`Invalid category "${category}". Valid: ${VALID_CATEGORIES.join(', ')}`);
    }

    const difficulty = row['difficultylevel'];
    if (!VALID_DIFFICULTIES.includes(difficulty as DifficultyLevel)) {
      rowErrors.push(`Invalid difficulty "${difficulty}". Valid: ${VALID_DIFFICULTIES.join(', ')}`);
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNum}: ${rowErrors.join('; ')}`);
      continue;
    }

    const isMCQ = category === QuestionCategory.mcqOneMark;
    const optionsRaw = row['options'] ?? '';
    const options = isMCQ && optionsRaw ? optionsRaw.split('|').map((o) => o.trim()).filter(Boolean) : undefined;
    const correctAnswer = isMCQ ? (row['correctanswer'] || undefined) : undefined;

    const marks = CATEGORY_MARKS[category] ?? 1;

    questions.push({
      id: BigInt(Date.now() + i),
      subjectId: row['subject'],
      category: category as QuestionCategory,
      questionText: row['questiontext'],
      options,
      correctAnswer,
      difficultyLevel: difficulty as DifficultyLevel,
      timestamp: BigInt(Date.now()),
    });
  }

  return { questions, errors };
}
