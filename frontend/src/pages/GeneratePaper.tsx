import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetSubjects, useGetAllQuestions, useGeneratePaper } from '../hooks/useQueries';
import { QuestionCategory } from '../backend';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function GeneratePaper() {
  const navigate = useNavigate();
  const { data: subjects = [] } = useGetSubjects();
  const { data: questions = [] } = useGetAllQuestions();
  const generatePaper = useGeneratePaper();

  const [form, setForm] = useState({
    subjectId: '',
    examDuration: 180,
    totalMarks: 100,
    mcqCount: 10,
    twoMarkCount: 5,
    fourMarkCount: 5,
    sixMarkCount: 2,
    eightMarkCount: 2,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const getAvailableCount = (category: QuestionCategory) => {
    if (!form.subjectId) return 0;
    return questions.filter(
      (q) => q.subjectId === form.subjectId && q.category === category
    ).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.subjectId) {
      setError('Please select a subject.');
      return;
    }

    const mcqAvail = getAvailableCount(QuestionCategory.mcqOneMark);
    const twoAvail = getAvailableCount(QuestionCategory._2Marks);
    const fourAvail = getAvailableCount(QuestionCategory._4Marks);
    const sixAvail = getAvailableCount(QuestionCategory._6Marks);
    const eightAvail = getAvailableCount(QuestionCategory._8Marks);

    if (form.mcqCount > mcqAvail) {
      setError(`Not enough MCQ questions. Available: ${mcqAvail}, Requested: ${form.mcqCount}`);
      return;
    }
    if (form.twoMarkCount > twoAvail) {
      setError(`Not enough 2-mark questions. Available: ${twoAvail}, Requested: ${form.twoMarkCount}`);
      return;
    }
    if (form.fourMarkCount > fourAvail) {
      setError(`Not enough 4-mark questions. Available: ${fourAvail}, Requested: ${form.fourMarkCount}`);
      return;
    }
    if (form.sixMarkCount > sixAvail) {
      setError(`Not enough 6-mark questions. Available: ${sixAvail}, Requested: ${form.sixMarkCount}`);
      return;
    }
    if (form.eightMarkCount > eightAvail) {
      setError(`Not enough 8-mark questions. Available: ${eightAvail}, Requested: ${form.eightMarkCount}`);
      return;
    }

    try {
      const paper = await generatePaper.mutateAsync({
        subjectId: form.subjectId,
        examDuration: BigInt(form.examDuration),
        totalMarks: BigInt(form.totalMarks),
        mcqCount: BigInt(form.mcqCount),
        twoMarkCount: BigInt(form.twoMarkCount),
        fourMarkCount: BigInt(form.fourMarkCount),
        sixMarkCount: BigInt(form.sixMarkCount),
        eightMarkCount: BigInt(form.eightMarkCount),
      });

      if (paper) {
        setSuccess('Paper generated successfully!');
        setTimeout(() => {
          navigate({ to: '/paper-preview', search: { paperId: String(paper.id) } });
        }, 800);
      } else {
        setError('Failed to generate paper. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to generate paper.');
    }
  };

  const selectedSubject = subjects.find((s) => s.code === form.subjectId);

  const questionCounts = form.subjectId
    ? [
        { label: 'MCQ (1 Mark)', available: getAvailableCount(QuestionCategory.mcqOneMark), requested: form.mcqCount },
        { label: '2 Marks', available: getAvailableCount(QuestionCategory._2Marks), requested: form.twoMarkCount },
        { label: '4 Marks', available: getAvailableCount(QuestionCategory._4Marks), requested: form.fourMarkCount },
        { label: '6 Marks', available: getAvailableCount(QuestionCategory._6Marks), requested: form.sixMarkCount },
        { label: '8 Marks', available: getAvailableCount(QuestionCategory._8Marks), requested: form.eightMarkCount },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-poppins">Generate Exam Paper</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure your exam paper and generate multiple variants automatically
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-navy-800 mb-1">Subject *</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => handleChange('subjectId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min={30}
                  max={360}
                  value={form.examDuration}
                  onChange={(e) => handleChange('examDuration', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Total Marks</label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={form.totalMarks}
                  onChange={(e) => handleChange('totalMarks', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-navy-800 mb-3">Question Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { field: 'mcqCount', label: 'MCQ (1 Mark)' },
                  { field: 'twoMarkCount', label: '2 Marks' },
                  { field: 'fourMarkCount', label: '4 Marks' },
                  { field: 'sixMarkCount', label: '6 Marks' },
                  { field: 'eightMarkCount', label: '8 Marks' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={form[field as keyof typeof form] as number}
                      onChange={(e) => handleChange(field, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-3 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={generatePaper.isPending}
              className="w-full bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {generatePaper.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate Paper (5 Variants)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {selectedSubject && (
            <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
              <h3 className="font-semibold text-navy-800 mb-3 text-sm">Selected Subject</h3>
              <p className="text-navy-900 font-medium">{selectedSubject.name}</p>
              <p className="text-gray-500 text-sm">{selectedSubject.code}</p>
            </div>
          )}

          {questionCounts.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
              <h3 className="font-semibold text-navy-800 mb-3 text-sm">Available Questions</h3>
              <div className="space-y-2">
                {questionCounts.map(({ label, available, requested }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{label}</span>
                    <span
                      className={`font-medium ${
                        requested > available ? 'text-red-500' : 'text-green-600'
                      }`}
                    >
                      {available} available
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-navy-50 rounded-2xl p-4 border border-navy-100">
            <h3 className="font-semibold text-navy-800 mb-2 text-sm">About Variants</h3>
            <p className="text-navy-600 text-xs leading-relaxed">
              The system generates 5 variants (A–E) of your exam paper. Each variant contains the same number of questions but in a different order, helping prevent cheating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
