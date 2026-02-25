import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useUpdateQuestion } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Question, Subject } from '../backend';
import { QuestionCategory, DifficultyLevel } from '../backend';

interface EditQuestionModalProps {
  question: Question;
  subjects: Subject[];
  open: boolean;
  onClose: () => void;
}

export default function EditQuestionModal({ question, subjects: _subjects, open, onClose }: EditQuestionModalProps) {
  const updateQuestion = useUpdateQuestion();

  const [questionText, setQuestionText] = useState(question.questionText);
  const [category, setCategory] = useState<QuestionCategory>(question.category as QuestionCategory);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(question.difficultyLevel as DifficultyLevel);
  const [options, setOptions] = useState<string[]>(question.options ?? ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer ?? '');

  useEffect(() => {
    setQuestionText(question.questionText);
    setCategory(question.category as QuestionCategory);
    setDifficulty(question.difficultyLevel as DifficultyLevel);
    setOptions(question.options ?? ['', '', '', '']);
    setCorrectAnswer(question.correctAnswer ?? '');
  }, [question]);

  const isMCQ = category === QuestionCategory.mcqOneMark;

  const handleSave = async () => {
    if (!questionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    if (isMCQ) {
      const filledOptions = options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        toast.error('MCQ questions require at least 2 options');
        return;
      }
      if (!correctAnswer.trim()) {
        toast.error('Please specify the correct answer');
        return;
      }
    }

    const updatedQuestion: Question = {
      ...question,
      questionText: questionText.trim(),
      category,
      difficultyLevel: difficulty,
      options: isMCQ ? options.filter((o) => o.trim()) : undefined,
      correctAnswer: isMCQ ? correctAnswer.trim() : undefined,
    };

    try {
      await updateQuestion.mutateAsync({ id: question.id, updatedQuestion });
      toast.success('Question updated successfully');
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update question');
    }
  };

  const selectClass = "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins">Edit Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Question Text
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Enter question text..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QuestionCategory)}
              className={selectClass}
            >
              <option value={QuestionCategory.mcqOneMark}>MCQ (1 Mark)</option>
              <option value={QuestionCategory._2Marks}>2 Marks</option>
              <option value={QuestionCategory._4Marks}>4 Marks</option>
              <option value={QuestionCategory._6Marks}>6 Marks</option>
              <option value={QuestionCategory._8Marks}>8 Marks</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className={selectClass}
            >
              <option value={DifficultyLevel.easy}>Easy</option>
              <option value={DifficultyLevel.medium}>Medium</option>
              <option value={DifficultyLevel.hard}>Hard</option>
            </select>
          </div>

          {/* MCQ Options */}
          {isMCQ && (
            <>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Options
                </label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: 'var(--navy-600)' }}
                      >
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx] = e.target.value;
                          setOptions(newOpts);
                        }}
                        className={inputClass}
                        placeholder={`Option ${['A', 'B', 'C', 'D'][idx]}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Correct Answer
                </label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select correct answer...</option>
                  {options.filter((o) => o.trim()).map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateQuestion.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-60"
            style={{ backgroundColor: 'var(--navy-700)' }}
            onMouseEnter={(e) => !updateQuestion.isPending && (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
          >
            {updateQuestion.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
