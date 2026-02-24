export function downloadCSVTemplate() {
  const csvContent = `subject,category,questionText,options,correctAnswer,difficultyLevel
DM101,mcq,What is the cardinality of the power set of a set with 3 elements?,2|4|8|16,8,easy
OS101,4marks,Explain the difference between process and thread.,,,medium
MP101,mcq,Which register is used as a stack pointer in 8086?,AX|BX|SP|BP,SP,medium`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'question_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
