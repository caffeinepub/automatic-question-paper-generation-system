import React from 'react';
import type { Question } from '../backend';

interface PaperSectionProps {
  title: string;
  questions: Question[];
  startNumber: number;
}

const optionLetters = ['A', 'B', 'C', 'D'];

export default function PaperSection({ title, questions, startNumber }: PaperSectionProps) {
  if (questions.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div
        className="px-4 py-2 rounded-lg mb-4 font-semibold text-sm text-white font-poppins"
        style={{ backgroundColor: 'var(--navy-700)' }}
      >
        {title}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, idx) => {
          const qNum = startNumber + idx;
          const isMCQ = question.category === 'mcqOneMark';

          return (
            <div key={String(question.id)} className="pl-2">
              <div className="flex gap-3">
                <span className="font-semibold text-sm text-foreground shrink-0 w-6">
                  {qNum}.
                </span>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    {question.questionText}
                  </p>
                  {isMCQ && question.options && question.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {question.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span className="font-semibold shrink-0">{optionLetters[optIdx]}.</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 font-medium">
                  [{question.category === 'mcqOneMark' ? 1 :
                    question.category === '_2Marks' ? 2 :
                    question.category === '_4Marks' ? 4 :
                    question.category === '_6Marks' ? 6 : 8} M]
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
