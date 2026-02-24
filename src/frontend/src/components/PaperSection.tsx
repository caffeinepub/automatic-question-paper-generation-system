import { QuestionCategory } from '../backend';

interface PaperSectionProps {
  title: string;
  questions: any[];
  startNumber: number;
}

export default function PaperSection({ title, questions, startNumber }: PaperSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-navy border-b-2 border-navy pb-2">
        {title}
      </h3>
      
      <div className="space-y-4">
        {questions.map((question, index) => {
          const questionNumber = startNumber + index;
          const isMCQ = question.category === QuestionCategory.mcqOneMark;
          
          return (
            <div key={question.id.toString()} className="space-y-2">
              <div className="flex gap-2">
                <span className="font-semibold">{questionNumber}.</span>
                <div className="flex-1">
                  <p>{question.questionText}</p>
                  
                  {isMCQ && question.options && (
                    <div className="mt-2 ml-4 space-y-1">
                      {question.options.map((option: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <span className="font-medium">{String.fromCharCode(65 + idx)})</span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
