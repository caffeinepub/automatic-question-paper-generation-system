import { Question, QuestionCategory } from '../backend';

interface PaperSectionProps {
  title: string;
  questions: Question[];
  marksPerQuestion: number;
  startNumber: number;
}

export default function PaperSection({ title, questions, marksPerQuestion, startNumber }: PaperSectionProps) {
  if (questions.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-navy-800 text-sm">{title}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
          {questions.length} × {marksPerQuestion} = {questions.length * marksPerQuestion} marks
        </span>
      </div>
      <div className="space-y-3">
        {questions.map((question, idx) => (
          <div key={String(question.id)} className="flex gap-3">
            <span className="text-sm font-semibold text-navy-700 shrink-0 w-6 text-right">
              {startNumber + idx}.
            </span>
            <div className="flex-1">
              <p className="text-sm text-navy-800">{question.questionText}</p>
              {question.category === QuestionCategory.mcqOneMark && question.options && question.options.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {question.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="font-medium text-navy-600 shrink-0">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">[{marksPerQuestion}]</span>
          </div>
        ))}
      </div>
    </div>
  );
}
