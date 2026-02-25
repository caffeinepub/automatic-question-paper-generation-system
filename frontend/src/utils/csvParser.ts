import { QuestionCategory, DifficultyLevel } from '../backend';

interface ParsedQuestion {
  subjectId: string;
  category: QuestionCategory;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  difficultyLevel: DifficultyLevel;
}

const CATEGORY_MAP: Record<string, QuestionCategory> = {
  mcqOneMark: QuestionCategory.mcqOneMark,
  mcqonemark: QuestionCategory.mcqOneMark,
  'mcq (1 mark)': QuestionCategory.mcqOneMark,
  '1 mark': QuestionCategory.mcqOneMark,
  _2marks: QuestionCategory._2Marks,
  '2marks': QuestionCategory._2Marks,
  '2 marks': QuestionCategory._2Marks,
  _4marks: QuestionCategory._4Marks,
  '4marks': QuestionCategory._4Marks,
  '4 marks': QuestionCategory._4Marks,
  _6marks: QuestionCategory._6Marks,
  '6marks': QuestionCategory._6Marks,
  '6 marks': QuestionCategory._6Marks,
  _8marks: QuestionCategory._8Marks,
  '8marks': QuestionCategory._8Marks,
  '8 marks': QuestionCategory._8Marks,
};

const DIFFICULTY_MAP: Record<string, DifficultyLevel> = {
  easy: DifficultyLevel.easy,
  medium: DifficultyLevel.medium,
  hard: DifficultyLevel.hard,
};

const CATEGORY_MARKS: Record<QuestionCategory, number> = {
  [QuestionCategory.mcqOneMark]: 1,
  [QuestionCategory._2Marks]: 2,
  [QuestionCategory._4Marks]: 4,
  [QuestionCategory._6Marks]: 6,
  [QuestionCategory._8Marks]: 8,
};

export function parseCSV(csvText: string): { questions: ParsedQuestion[]; errors: string[] } {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { questions: [], errors: ['CSV file is empty or has no data rows.'] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const requiredHeaders = ['subjectid', 'category', 'questiontext', 'difficultylevel'];
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    return {
      questions: [],
      errors: [`Missing required headers: ${missingHeaders.join(', ')}`],
    };
  }

  const questions: ParsedQuestion[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });

    const rowNum = i + 1;

    const subjectId = row['subjectid'];
    const categoryRaw = row['category']?.toLowerCase();
    const questionText = row['questiontext'];
    const difficultyRaw = row['difficultylevel']?.toLowerCase();
    const optionsRaw = row['options'] ?? '';
    const correctAnswer = row['correctanswer'] ?? '';
    const marksRaw = row['marks'] ?? '';

    if (!subjectId) {
      errors.push(`Row ${rowNum}: Missing subjectId.`);
      continue;
    }
    if (!questionText) {
      errors.push(`Row ${rowNum}: Missing questionText.`);
      continue;
    }

    const category = CATEGORY_MAP[categoryRaw];
    if (!category) {
      errors.push(`Row ${rowNum}: Invalid category "${row['category']}".`);
      continue;
    }

    const difficultyLevel = DIFFICULTY_MAP[difficultyRaw];
    if (!difficultyLevel) {
      errors.push(`Row ${rowNum}: Invalid difficulty "${row['difficultylevel']}".`);
      continue;
    }

    if (marksRaw) {
      const marks = parseInt(marksRaw);
      const expectedMarks = CATEGORY_MARKS[category];
      if (!isNaN(marks) && marks !== expectedMarks) {
        errors.push(
          `Row ${rowNum}: Marks mismatch. Category "${category}" expects ${expectedMarks} marks but got ${marks}.`
        );
        continue;
      }
    }

    const options = optionsRaw
      ? optionsRaw.split('|').map((o) => o.trim()).filter(Boolean)
      : undefined;

    questions.push({
      subjectId,
      category,
      questionText,
      options: options && options.length > 0 ? options : undefined,
      correctAnswer: correctAnswer || undefined,
      difficultyLevel,
    });
  }

  return { questions, errors };
}
