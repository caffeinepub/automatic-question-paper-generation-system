export function downloadCSVTemplate() {
  const headers = 'subject,category,questionText,options,correctAnswer,difficultyLevel,marks';
  const rows = [
    'CS101,mcqOneMark,What is the time complexity of binary search?,O(n)|O(log n)|O(n log n)|O(1),O(log n),easy,1',
    'CS101,_2Marks,Explain the concept of recursion.,,,,medium,2',
    'CS101,_4Marks,Describe the differences between stack and queue data structures.,,,,medium,4',
    'CS101,_6Marks,Explain the working of quicksort algorithm with an example.,,,,hard,6',
    'CS101,_8Marks,Compare and contrast BFS and DFS graph traversal algorithms.,,,,hard,8',
  ];
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}
