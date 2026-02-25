import { useState } from 'react';
import { useGetSubjects, useGetAllQuestions, useDeleteQuestion } from '../hooks/useQueries';
import QuestionCard from '../components/QuestionCard';
import SubjectManager from '../components/SubjectManager';
import { Search, BookOpen, Layers } from 'lucide-react';
import { QuestionCategory, DifficultyLevel } from '../backend';

const CATEGORY_LABELS: Record<string, string> = {
  mcqOneMark: 'MCQ (1 Mark)',
  _2Marks: '2 Marks',
  _4Marks: '4 Marks',
  _6Marks: '6 Marks',
  _8Marks: '8 Marks',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export default function QuestionBank() {
  const [activeTab, setActiveTab] = useState<'questions' | 'subjects'>('questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const { data: subjects = [] } = useGetSubjects();
  const { data: questions = [], isLoading, isError, refetch } = useGetAllQuestions();
  const deleteQuestion = useDeleteQuestion();

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      !searchQuery || q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || q.subjectId === selectedSubject;
    const matchesCategory = !selectedCategory || q.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || q.difficultyLevel === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesCategory && matchesDifficulty;
  });

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.code === subjectId)?.name ?? subjectId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-poppins">Question Bank</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your questions and subjects
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'questions'
              ? 'bg-white text-navy-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Questions ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'subjects'
              ? 'bg-white text-navy-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Subjects ({subjects.length})
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
              >
                <option value="">All Difficulties</option>
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions List */}
          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
              <div className="w-8 h-8 border-2 border-navy-300 border-t-navy-700 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading questions...</p>
            </div>
          ) : isError ? (
            <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
              <p className="text-red-500 text-sm mb-3">Failed to load questions.</p>
              <button
                onClick={() => refetch()}
                className="bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-navy-800 mb-1">No Questions Found</h3>
              <p className="text-gray-500 text-sm">
                {questions.length === 0
                  ? 'Your question bank is empty. Add questions to get started.'
                  : 'No questions match your current filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Showing {filteredQuestions.length} of {questions.length} questions
              </p>
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={String(question.id)}
                  question={question}
                  subjectName={getSubjectName(question.subjectId)}
                  onDelete={(id) => deleteQuestion.mutate(id)}
                  isDeleting={deleteQuestion.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'subjects' && <SubjectManager />}
    </div>
  );
}
