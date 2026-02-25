import React, { useState, useRef } from 'react';
import { useGetSubjects, useAddQuestion, useBulkUploadQuestions } from '../hooks/useQueries';
import { PlusCircle, Upload, Loader2, AlertCircle, CheckCircle2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { parseCSV } from '../utils/csvParser';
import { parseJSON } from '../utils/jsonParser';
import { downloadCSVTemplate } from '../utils/csvTemplate';
import { QuestionCategory, DifficultyLevel } from '../backend';
import type { Question } from '../backend';

type TabType = 'single' | 'bulk';

export default function AddQuestion() {
  const [activeTab, setActiveTab] = useState<TabType>('single');
  const { data: subjects = [] } = useGetSubjects();
  const addQuestion = useAddQuestion();
  const bulkUpload = useBulkUploadQuestions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single question form state
  const [subjectId, setSubjectId] = useState('');
  const [category, setCategory] = useState<QuestionCategory>(QuestionCategory.mcqOneMark);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.medium);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  // Bulk upload state
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isMCQ = category === QuestionCategory.mcqOneMark;

  const resetSingleForm = () => {
    setSubjectId('');
    setCategory(QuestionCategory.mcqOneMark);
    setDifficulty(DifficultyLevel.medium);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
  };

  const handleSingleSubmit = async () => {
    if (!subjectId) { toast.error('Please select a subject'); return; }
    if (!questionText.trim()) { toast.error('Please enter question text'); return; }
    if (isMCQ) {
      const filled = options.filter((o) => o.trim());
      if (filled.length < 2) { toast.error('MCQ requires at least 2 options'); return; }
      if (!correctAnswer.trim()) { toast.error('Please specify the correct answer'); return; }
    }

    try {
      await addQuestion.mutateAsync({
        subjectId,
        category,
        questionText: questionText.trim(),
        options: isMCQ ? options.filter((o) => o.trim()) : null,
        correctAnswer: isMCQ ? correctAnswer.trim() : null,
        difficultyLevel: difficulty,
      });
      toast.success('Question added successfully!');
      resetSingleForm();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add question');
    }
  };

  const processFile = async (file: File) => {
    setBulkErrors([]);
    setBulkSuccess(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    let parsed: { questions: Question[]; errors: string[] } = { questions: [], errors: [] };

    try {
      if (ext === 'csv') {
        const text = await file.text();
        parsed = parseCSV(text);
      } else if (ext === 'json') {
        const text = await file.text();
        parsed = parseJSON(text);
      } else {
        setBulkErrors(['Unsupported file format. Please use CSV or JSON.']);
        return;
      }
    } catch (err: any) {
      setBulkErrors([`File parsing error: ${err?.message ?? 'Unknown error'}`]);
      return;
    }

    if (parsed.errors.length > 0) {
      setBulkErrors(parsed.errors);
    }

    if (parsed.questions.length === 0) {
      if (parsed.errors.length === 0) {
        setBulkErrors(['No valid questions found in the file.']);
      }
      return;
    }

    try {
      const count = await bulkUpload.mutateAsync(parsed.questions);
      const successMsg = `Successfully uploaded ${count} question${Number(count) !== 1 ? 's' : ''}!`;
      setBulkSuccess(successMsg);
      toast.success(successMsg);
    } catch (err: any) {
      setBulkErrors([err?.message ?? 'Failed to upload questions']);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const selectClass = "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  const tabClass = (tab: TabType) =>
    `px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
      activeTab === tab
        ? 'text-white shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--navy-100)' }}
        >
          <PlusCircle className="w-5 h-5" style={{ color: 'var(--navy-700)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-poppins text-foreground">Add Question</h1>
          <p className="text-sm text-muted-foreground">Add questions to your question bank</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ backgroundColor: 'var(--navy-100)' }}>
        <button
          onClick={() => setActiveTab('single')}
          className={tabClass('single')}
          style={activeTab === 'single' ? { backgroundColor: 'var(--navy-700)' } : {}}
        >
          Single Question
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={tabClass('bulk')}
          style={activeTab === 'bulk' ? { backgroundColor: 'var(--navy-700)' } : {}}
        >
          Bulk Upload
        </button>
      </div>

      {activeTab === 'single' && (
        <div className="academic-card space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Subject
            </label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={selectClass}>
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as QuestionCategory);
                setOptions(['', '', '', '']);
                setCorrectAnswer('');
              }}
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
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)} className={selectClass}>
              <option value={DifficultyLevel.easy}>Easy</option>
              <option value={DifficultyLevel.medium}>Medium</option>
              <option value={DifficultyLevel.hard}>Hard</option>
            </select>
          </div>

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
              placeholder="Enter your question here..."
            />
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

          {/* Submit */}
          <button
            onClick={handleSingleSubmit}
            disabled={addQuestion.isPending}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ backgroundColor: 'var(--navy-700)' }}
            onMouseEnter={(e) => !addQuestion.isPending && (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
          >
            {addQuestion.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding Question...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Add Question
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="space-y-4">
          {/* Template Downloads */}
          <div className="academic-card">
            <h3 className="text-sm font-semibold font-poppins text-foreground mb-3">Download Templates</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadCSVTemplate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" style={{ color: 'var(--navy-600)' }} />
                CSV Template
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="academic-card">
            <h3 className="text-sm font-semibold font-poppins text-foreground mb-3">Upload File</h3>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all border-border hover:border-muted-foreground"
              style={isDragging ? { borderColor: 'var(--navy-500)', backgroundColor: 'var(--navy-50)' } : {}}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">
                {bulkUpload.isPending ? 'Processing...' : 'Drop file here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground">Supports CSV and JSON</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Errors */}
          {bulkErrors.length > 0 && (
            <div className="academic-card border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-semibold text-destructive">Upload Errors</span>
              </div>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {bulkErrors.map((err, i) => (
                  <li key={i} className="text-xs text-destructive">• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success */}
          {bulkSuccess && (
            <div className="academic-card border-green-200 bg-green-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">{bulkSuccess}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
