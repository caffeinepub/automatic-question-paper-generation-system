import { useState } from 'react';
import { Question, QuestionCategory, DifficultyLevel } from '../backend';
import EditQuestionModal from './EditQuestionModal';
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  subjectName: string;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  mcqOneMark: 'MCQ (1 Mark)',
  _2Marks: '2 Marks',
  _4Marks: '4 Marks',
  _6Marks: '6 Marks',
  _8Marks: '8 Marks',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function QuestionCard({ question, subjectName, onDelete, isDeleting }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isMCQ = question.category === QuestionCategory.mcqOneMark;

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-medium bg-navy-100 text-navy-700 px-2 py-0.5 rounded-lg">
                {subjectName}
              </span>
              <span className="text-xs font-medium bg-lightblue-100 text-lightblue-700 px-2 py-0.5 rounded-lg">
                {CATEGORY_LABELS[question.category] ?? question.category}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                  DIFFICULTY_COLORS[question.difficultyLevel] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {question.difficultyLevel}
              </span>
            </div>
            <p className="text-sm text-navy-800 leading-relaxed">
              {question.questionText}
            </p>

            {isMCQ && question.options && question.options.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-lightblue-600 hover:text-lightblue-700 mt-2"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'Hide options' : 'Show options'}
              </button>
            )}

            {expanded && isMCQ && question.options && (
              <div className="grid grid-cols-2 gap-1 mt-2">
                {question.options.map((opt, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className="font-medium text-navy-600 shrink-0">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-navy-600 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              disabled={isDeleting}
              className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditQuestionModal
          question={question}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
