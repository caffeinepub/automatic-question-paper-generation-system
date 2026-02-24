import { DifficultyLevel, QuestionCategory, type Question } from '../backend';

interface ParseResult {
  validQuestions: Omit<Question, 'id' | 'timestamp'>[];
  errors: { row: number; message: string }[];
}

export function parseCSV(csvText: string): ParseResult {
  const validQuestions: Omit<Question, 'id' | 'timestamp'>[] = [];
  const errors: { row: number; message: string }[] = [];

  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    errors.push({ row: 0, message: 'CSV file is empty or has no data rows' });
    return { validQuestions, errors };
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const expectedHeaders = ['subject', 'category', 'questiontext', 'options', 'correctanswer', 'difficultylevel'];
  
  const hasAllHeaders = expectedHeaders.every(h => header.includes(h));
  if (!hasAllHeaders) {
    errors.push({ 
      row: 0, 
      message: `Invalid CSV header. Expected columns: ${expectedHeaders.join(', ')}` 
    });
    return { validQuestions, errors };
  }

  // Get column indices
  const getIndex = (name: string) => header.indexOf(name.toLowerCase());
  const subjectIdx = getIndex('subject');
  const categoryIdx = getIndex('category');
  const questionTextIdx = getIndex('questiontext');
  const optionsIdx = getIndex('options');
  const correctAnswerIdx = getIndex('correctanswer');
  const difficultyIdx = getIndex('difficultylevel');

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split(',').map(v => v.trim());
    const rowNum = i + 1;

    try {
      // Validate required fields
      const subjectId = values[subjectIdx];
      const categoryStr = values[categoryIdx];
      const questionText = values[questionTextIdx];
      const optionsStr = values[optionsIdx];
      const correctAnswer = values[correctAnswerIdx];
      const difficultyStr = values[difficultyIdx];

      if (!subjectId) {
        errors.push({ row: rowNum, message: 'Missing required field: subject' });
        continue;
      }

      if (!categoryStr) {
        errors.push({ row: rowNum, message: 'Missing required field: category' });
        continue;
      }

      if (!questionText) {
        errors.push({ row: rowNum, message: 'Missing required field: questionText' });
        continue;
      }

      if (!difficultyStr) {
        errors.push({ row: rowNum, message: 'Missing required field: difficultyLevel' });
        continue;
      }

      // Parse category
      let category: QuestionCategory;
      const categoryLower = categoryStr.toLowerCase();
      if (categoryLower === 'mcq') {
        category = QuestionCategory.mcqOneMark;
      } else if (categoryLower === '2marks' || categoryLower === '2') {
        category = QuestionCategory._2Marks;
      } else if (categoryLower === '4marks' || categoryLower === '4') {
        category = QuestionCategory._4Marks;
      } else if (categoryLower === '6marks' || categoryLower === '6') {
        category = QuestionCategory._6Marks;
      } else if (categoryLower === '8marks' || categoryLower === '8') {
        category = QuestionCategory._8Marks;
      } else {
        errors.push({ row: rowNum, message: `Invalid category: ${categoryStr}. Use: mcq, 2marks, 4marks, 6marks, or 8marks` });
        continue;
      }

      // Parse difficulty
      let difficultyLevel: DifficultyLevel;
      const difficultyLower = difficultyStr.toLowerCase();
      if (difficultyLower === 'easy') {
        difficultyLevel = DifficultyLevel.easy;
      } else if (difficultyLower === 'medium') {
        difficultyLevel = DifficultyLevel.medium;
      } else if (difficultyLower === 'hard') {
        difficultyLevel = DifficultyLevel.hard;
      } else {
        errors.push({ row: rowNum, message: `Invalid difficulty: ${difficultyStr}. Use: easy, medium, or hard` });
        continue;
      }

      // Parse options for MCQ
      let options: string[] | null = null;
      let correctAnswerValue: string | null = null;

      if (category === QuestionCategory.mcqOneMark) {
        if (!optionsStr) {
          errors.push({ row: rowNum, message: 'MCQ questions require options (pipe-separated, e.g., A|B|C|D)' });
          continue;
        }
        if (!correctAnswer) {
          errors.push({ row: rowNum, message: 'MCQ questions require a correct answer' });
          continue;
        }

        options = optionsStr.split('|').map(o => o.trim()).filter(o => o);
        if (options.length < 2) {
          errors.push({ row: rowNum, message: 'MCQ questions must have at least 2 options' });
          continue;
        }

        correctAnswerValue = correctAnswer;
      }

      // Create question object
      const question: Omit<Question, 'id' | 'timestamp'> = {
        subjectId,
        category,
        questionText,
        options: options || undefined,
        correctAnswer: correctAnswerValue || undefined,
        difficultyLevel,
      };

      validQuestions.push(question);
    } catch (error) {
      errors.push({ row: rowNum, message: `Error parsing row: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  }

  return { validQuestions, errors };
}
