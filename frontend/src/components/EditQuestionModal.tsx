import { useState } from 'react';
import { Question, QuestionCategory, DifficultyLevel } from '../backend';
import { useUpdateQuestion } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface EditQuestionModalProps {
  question: Question;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { value: QuestionCategory.mcqOneMark, label: 'MCQ (1 Mark)' },
  { value: QuestionCategory._2Marks, label: '2 Marks' },
  { value: QuestionCategory._4Marks, label: '4 Marks' },
  { value: QuestionCategory._6Marks, label: '6 Marks' },
  { value: QuestionCategory._8Marks, label: '8 Marks' },
];

const DIFFICULTY_OPTIONS = [
  { value: DifficultyLevel.easy, label: 'Easy' },
  { value: DifficultyLevel.medium, label: 'Medium' },
  { value: DifficultyLevel.hard, label: 'Hard' },
];

export default function EditQuestionModal({ question, onClose }: EditQuestionModalProps) {
  const updateQuestion = useUpdateQuestion();

  const [form, setForm] = useState({
    questionText: question.questionText,
    category: question.category,
    difficultyLevel: question.difficultyLevel,
    options: question.options ? [...question.options, '', '', ''].slice(0, 4) : ['', '', '', ''],
    correctAnswer: question.correctAnswer ?? '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMCQ = form.category === QuestionCategory.mcqOneMark;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleOptionChange = (index: number, value: string) => {
    setForm((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.questionText.trim()) {
      setError('Question text is required.');
      return;
    }
    if (isMCQ) {
      const filledOptions = form.options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        setError('MCQ questions require at least 2 options.');
        return;
      }
      if (!form.correctAnswer.trim()) {
        setError('Please provide the correct answer for MCQ.');
        return;
      }
    }

    const updatedQuestion: Question = {
      ...question,
      questionText: form.questionText.trim(),
      category: form.category as QuestionCategory,
      difficultyLevel: form.difficultyLevel as DifficultyLevel,
      options: isMCQ ? form.options.filter((o) => o.trim()) : undefined,
      correctAnswer: isMCQ ? form.correctAnswer.trim() : undefined,
    };

    try {
      await updateQuestion.mutateAsync({ id: question.id, updatedQuestion });
      setSuccess('Question updated successfully!');
      setTimeout(onClose, 800);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update question.');
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Difficulty</label>
              <select
                value={form.difficultyLevel}
                onChange={(e) => handleChange('difficultyLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">Question Text *</label>
            <textarea
              value={form.questionText}
              onChange={(e) => handleChange('questionText', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 resize-none"
            />
          </div>

          {isMCQ && (
            <>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-2">Options</label>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Correct Answer</label>
                <input
                  type="text"
                  value={form.correctAnswer}
                  onChange={(e) => handleChange('correctAnswer', e.target.value)}
                  placeholder="Enter the correct answer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-3 py-2 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateQuestion.isPending}
              className="bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              {updateQuestion.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
