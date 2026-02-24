import { DifficultyLevel, QuestionCategory, type Question } from '../backend';

interface ParseResult {
  validQuestions: Omit<Question, 'id' | 'timestamp'>[];
  errors: { index: number; message: string }[];
}

export function parseJSON(jsonText: string): ParseResult {
  const validQuestions: Omit<Question, 'id' | 'timestamp'>[] = [];
  const errors: { index: number; message: string }[] = [];

  try {
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      errors.push({ index: 0, message: 'JSON must be an array of question objects' });
      return { validQuestions, errors };
    }

    data.forEach((item, index) => {
      try {
        // Validate required fields
        if (!item.subjectId || typeof item.subjectId !== 'string') {
          errors.push({ index, message: 'Missing or invalid required field: subjectId' });
          return;
        }

        if (!item.category || typeof item.category !== 'string') {
          errors.push({ index, message: 'Missing or invalid required field: category' });
          return;
        }

        if (!item.questionText || typeof item.questionText !== 'string') {
          errors.push({ index, message: 'Missing or invalid required field: questionText' });
          return;
        }

        if (!item.difficultyLevel || typeof item.difficultyLevel !== 'string') {
          errors.push({ index, message: 'Missing or invalid required field: difficultyLevel' });
          return;
        }

        // Validate category enum
        const validCategories = ['mcq', '_2Marks', '_4Marks', '_6Marks', '_8Marks'];
        if (!validCategories.includes(item.category)) {
          errors.push({ index, message: `Invalid category: ${item.category}. Use: ${validCategories.join(', ')}` });
          return;
        }

        // Validate difficulty enum
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(item.difficultyLevel)) {
          errors.push({ index, message: `Invalid difficulty: ${item.difficultyLevel}. Use: ${validDifficulties.join(', ')}` });
          return;
        }

        // Validate MCQ-specific fields
        if (item.category === 'mcq') {
          if (!item.options || !Array.isArray(item.options) || item.options.length < 2) {
            errors.push({ index, message: 'MCQ questions require an options array with at least 2 items' });
            return;
          }
          if (!item.correctAnswer || typeof item.correctAnswer !== 'string') {
            errors.push({ index, message: 'MCQ questions require a correctAnswer field' });
            return;
          }
        }

        // Create validated question object
        const question: Omit<Question, 'id' | 'timestamp'> = {
          subjectId: item.subjectId,
          category: item.category as QuestionCategory,
          questionText: item.questionText,
          options: item.options || undefined,
          correctAnswer: item.correctAnswer || undefined,
          difficultyLevel: item.difficultyLevel as DifficultyLevel,
        };

        validQuestions.push(question);
      } catch (error) {
        errors.push({ 
          index, 
          message: `Error validating entry: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    });
  } catch (error) {
    errors.push({ 
      index: 0, 
      message: `Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }

  return { validQuestions, errors };
}
