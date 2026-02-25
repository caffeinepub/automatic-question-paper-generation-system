/**
 * Generates and downloads a CSV template for bulk question upload.
 *
 * Column format (must match csvParser.ts expectations):
 *   subjectId   - The subject code (e.g. CS101) — must match a subject code in the system
 *   category    - One of: mcqOneMark | _2Marks | _4Marks | _6Marks | _8Marks
 *   questionText - The full question text
 *   options     - Pipe-separated options for MCQ (e.g. A|B|C|D), leave empty for non-MCQ
 *   correctAnswer - The correct answer for MCQ, leave empty for non-MCQ
 *   difficultyLevel - One of: easy | medium | hard
 *   marks       - Must match category: mcqOneMark=1, _2Marks=2, _4Marks=4, _6Marks=6, _8Marks=8
 */
export function downloadCSVTemplate() {
  // Header row — column names must match what csvParser.ts looks for (case-insensitive)
  const headers = 'subjectId,category,questionText,options,correctAnswer,difficultyLevel,marks';

  // Example rows demonstrating all question types.
  // Replace CS101 with your actual subject code.
  // For MCQ: fill options (pipe-separated) and correctAnswer.
  // For non-MCQ: leave options and correctAnswer columns empty.
  const rows = [
    // MCQ examples (1 mark each)
    'CS101,mcqOneMark,What is the time complexity of binary search?,O(n)|O(log n)|O(n log n)|O(1),O(log n),easy,1',
    'CS101,mcqOneMark,Which data structure follows LIFO order?,Stack|Queue|Array|Linked List,Stack,medium,1',
    // 2 Marks short answer
    'CS101,_2Marks,Define recursion and give one example.,,,medium,2',
    // 4 Marks descriptive
    'CS101,_4Marks,Explain the differences between stack and queue data structures.,,,medium,4',
    // 6 Marks essay
    'CS101,_6Marks,Describe the working of quicksort algorithm with a suitable example.,,,hard,6',
    // 8 Marks essay
    'CS101,_8Marks,Compare and contrast BFS and DFS graph traversal algorithms with diagrams.,,,hard,8',
  ];

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
