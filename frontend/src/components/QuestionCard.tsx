import React, { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import EditQuestionModal from './EditQuestionModal';
import { useDeleteQuestion } from '../hooks/useQueries';
import type { Question, Subject } from '../backend';

interface QuestionCardProps {
  question: Question;
  subjects: Subject[];
}

const categoryLabels: Record<string, string> = {
  mcqOneMark: 'MCQ (1 Mark)',
  _2Marks: '2 Marks',
  _4Marks: '4 Marks',
  _6Marks: '6 Marks',
  _8Marks: '8 Marks',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function QuestionCard({ question, subjects }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const deleteQuestion = useDeleteQuestion();

  const subject = subjects.find((s) => s.id === question.subjectId);
  const categoryLabel = categoryLabels[question.category] ?? question.category;
  const difficultyClass = difficultyColors[question.difficultyLevel] ?? 'bg-gray-100 text-gray-700';

  const isMCQ = question.category === 'mcqOneMark';
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="academic-card hover:shadow-card-hover transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-2">
          {subject && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: 'var(--navy-100)', color: 'var(--navy-700)' }}
            >
              {subject.name}
            </span>
          )}
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: 'var(--lightblue-100)', color: 'var(--lightblue-600)' }}
          >
            {categoryLabel}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${difficultyClass}`}>
            {question.difficultyLevel}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditOpen(true)}
            className="p-1.5 rounded-lg transition-colors hover:bg-muted"
            title="Edit question"
          >
            <Edit2 className="w-4 h-4" style={{ color: 'var(--navy-600)' }} />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this question? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteQuestion.mutate(question.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Question Text */}
      <p className="text-sm text-foreground leading-relaxed mb-3">
        {question.questionText}
      </p>

      {/* MCQ Options */}
      {isMCQ && question.options && question.options.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium mb-2 transition-colors"
            style={{ color: 'var(--navy-600)' }}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide options' : 'Show options'}
          </button>
          {expanded && (
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((opt, idx) => {
                const isCorrect = opt === question.correctAnswer;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                      isCorrect
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <span className="font-bold shrink-0">{optionLetters[idx]}.</span>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <EditQuestionModal
        question={question}
        subjects={subjects}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
