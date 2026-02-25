import React, { useState } from 'react';
import { useGetAllQuestions, useGetSubjects } from '../hooks/useQueries';
import QuestionCard from '../components/QuestionCard';
import SubjectManager from '../components/SubjectManager';
import { BookOpen, Search, Filter, Loader2, RefreshCw } from 'lucide-react';

type TabType = 'questions' | 'subjects';

export default function QuestionBank() {
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  const {
    data: questions = [],
    isLoading: questionsLoading,
    isError: questionsError,
    refetch: refetchQuestions,
  } = useGetAllQuestions();

  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjects();

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = !searchQuery || q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !filterSubject || q.subjectId === filterSubject;
    const matchesCategory = !filterCategory || q.category === filterCategory;
    const matchesDifficulty = !filterDifficulty || q.difficultyLevel === filterDifficulty;
    return matchesSearch && matchesSubject && matchesCategory && matchesDifficulty;
  });

  const tabClass = (tab: TabType) =>
    `px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
      activeTab === tab
        ? 'text-white shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--navy-100)' }}
        >
          <BookOpen className="w-5 h-5" style={{ color: 'var(--navy-700)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-poppins text-foreground">Question Bank</h1>
          <p className="text-sm text-muted-foreground">Manage your questions and subjects</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ backgroundColor: 'var(--navy-100)' }}>
        <button
          onClick={() => setActiveTab('questions')}
          className={tabClass('questions')}
          style={activeTab === 'questions' ? { backgroundColor: 'var(--navy-700)' } : {}}
        >
          Questions ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={tabClass('subjects')}
          style={activeTab === 'subjects' ? { backgroundColor: 'var(--navy-700)' } : {}}
        >
          Subjects ({subjects.length})
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="academic-card">
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Categories</option>
                <option value="mcqOneMark">MCQ (1 Mark)</option>
                <option value="_2Marks">2 Marks</option>
                <option value="_4Marks">4 Marks</option>
                <option value="_6Marks">6 Marks</option>
                <option value="_8Marks">8 Marks</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions List */}
          {questionsLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Loading questions...</span>
            </div>
          ) : questionsError ? (
            <div className="academic-card text-center py-12">
              <p className="text-sm text-destructive mb-4">Failed to load questions.</p>
              <button
                onClick={() => refetchQuestions()}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="academic-card text-center py-12">
              <Filter className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {questions.length === 0
                  ? 'No questions in the bank yet. Add questions to get started.'
                  : 'No questions match your current filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredQuestions.map((q) => (
                <QuestionCard key={String(q.id)} question={q} subjects={subjects} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <SubjectManager />
      )}
    </div>
  );
}
