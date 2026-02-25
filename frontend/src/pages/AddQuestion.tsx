import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetSubjects, useAddQuestion, useBulkUploadQuestions } from '../hooks/useQueries';
import { QuestionCategory, DifficultyLevel } from '../backend';
import { parseCSV } from '../utils/csvParser';
import { parseJSON } from '../utils/jsonParser';
import { downloadCSVTemplate } from '../utils/csvTemplate';
import { PlusCircle, Upload, Download, X, CheckCircle, AlertCircle } from 'lucide-react';

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

interface ParsedQuestion {
  subjectId: string;
  category: QuestionCategory;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  difficultyLevel: DifficultyLevel;
}

export default function AddQuestion() {
  const navigate = useNavigate();
  const { data: subjects = [] } = useGetSubjects();
  const addQuestion = useAddQuestion();
  const bulkUpload = useBulkUploadQuestions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [form, setForm] = useState({
    subjectId: '',
    category: QuestionCategory.mcqOneMark,
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficultyLevel: DifficultyLevel.medium,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<ParsedQuestion[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkSuccess, setBulkSuccess] = useState('');

  const isMCQ = form.category === QuestionCategory.mcqOneMark;

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
    setFormSuccess('');
  };

  const handleOptionChange = (index: number, value: string) => {
    setForm((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.subjectId) {
      setFormError('Please select a subject.');
      return;
    }
    if (!form.questionText.trim()) {
      setFormError('Question text is required.');
      return;
    }
    if (isMCQ) {
      const filledOptions = form.options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        setFormError('MCQ questions require at least 2 options.');
        return;
      }
      if (!form.correctAnswer.trim()) {
        setFormError('Please provide the correct answer for MCQ.');
        return;
      }
    }

    try {
      await addQuestion.mutateAsync({
        subjectId: form.subjectId,
        category: form.category,
        questionText: form.questionText.trim(),
        options: isMCQ ? form.options.filter((o) => o.trim()) : undefined,
        correctAnswer: isMCQ ? form.correctAnswer.trim() : undefined,
        difficultyLevel: form.difficultyLevel,
      });
      setFormSuccess('Question added successfully!');
      setForm({
        subjectId: form.subjectId,
        category: form.category,
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        difficultyLevel: form.difficultyLevel,
      });
    } catch (err: any) {
      setFormError(err?.message ?? 'Failed to add question.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setBulkPreview([]);
    setBulkErrors([]);
    setBulkSuccess('');

    try {
      let result: { questions: ParsedQuestion[]; errors: string[] };
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        result = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        result = parseJSON(text);
      } else {
        setBulkErrors(['Unsupported file format. Please use CSV or JSON.']);
        return;
      }
      setBulkPreview(result.questions);
      setBulkErrors(result.errors);
    } catch (err: any) {
      setBulkErrors([err?.message ?? 'Failed to parse file.']);
    }
  };

  const handleBulkUpload = async () => {
    if (bulkPreview.length === 0) return;
    setBulkSuccess('');

    try {
      const count = await bulkUpload.mutateAsync(bulkPreview);
      setBulkSuccess(`Successfully uploaded ${count} questions!`);
      setBulkPreview([]);
      setBulkFile(null);
      setBulkErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setBulkErrors([err?.message ?? 'Bulk upload failed.']);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-poppins">Add Questions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Add questions individually or upload in bulk via CSV/JSON
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'single'
              ? 'bg-white text-navy-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Single Entry
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'bulk'
              ? 'bg-white text-navy-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Bulk Upload
        </button>
      </div>

      {activeTab === 'single' && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <form onSubmit={handleSingleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Subject *</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => handleFormChange('subjectId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
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
                <label className="block text-sm font-medium text-navy-800 mb-1">Difficulty *</label>
                <select
                  value={form.difficultyLevel}
                  onChange={(e) => handleFormChange('difficultyLevel', e.target.value)}
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
                onChange={(e) => handleFormChange('questionText', e.target.value)}
                rows={3}
                placeholder="Enter the question text..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 resize-none"
              />
            </div>

            {isMCQ && (
              <>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Options *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block text-sm font-medium text-navy-800 mb-1">Correct Answer *</label>
                  <input
                    type="text"
                    value={form.correctAnswer}
                    onChange={(e) => handleFormChange('correctAnswer', e.target.value)}
                    placeholder="Enter the correct answer (e.g., A or the answer text)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                  />
                </div>
              </>
            )}

            {formError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-3 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {formSuccess}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={addQuestion.isPending}
                className="bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                {addQuestion.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Add Question
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: '/question-bank' })}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                View Question Bank
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-800">Upload Questions File</h2>
              <button
                onClick={downloadCSVTemplate}
                className="flex items-center gap-2 text-lightblue-600 hover:text-lightblue-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>

            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-navy-300 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-navy-700 font-medium mb-1">
                {bulkFile ? bulkFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-gray-400 text-sm">Supports CSV and JSON formats</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {bulkErrors.length > 0 && (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Errors ({bulkErrors.length})
              </h3>
              <ul className="space-y-1">
                {bulkErrors.map((err, idx) => (
                  <li key={idx} className="text-red-600 text-sm">
                    • {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bulkSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-3 text-sm border border-green-100">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {bulkSuccess}
            </div>
          )}

          {bulkPreview.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-800">
                  Preview ({bulkPreview.length} questions)
                </h3>
                <button
                  onClick={handleBulkUpload}
                  disabled={bulkUpload.isPending}
                  className="bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                >
                  {bulkUpload.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload All
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bulkPreview.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                    <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-navy-800 line-clamp-2">{q.questionText}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-lg">
                          {q.subjectId}
                        </span>
                        <span className="text-xs text-gray-400">{q.category}</span>
                        <span className="text-xs text-gray-400">{q.difficultyLevel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setBulkPreview((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
