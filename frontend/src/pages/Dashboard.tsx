import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllQuestions, useGetSubjects, useGetMyPapers } from '../hooks/useQueries';
import StatsCard from '../components/StatsCard';
import WorkflowDiagram from '../components/WorkflowDiagram';
import { BookOpen, FileText, HelpCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: questions = [], isLoading: questionsLoading } = useGetAllQuestions();
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjects();
  const { data: papers = [], isLoading: papersLoading } = useGetMyPapers();

  const principalStr = identity?.getPrincipal().toString() ?? '';
  const shortPrincipal = principalStr.length > 12
    ? `${principalStr.slice(0, 6)}...${principalStr.slice(-4)}`
    : principalStr;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ backgroundColor: 'var(--navy-800)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
          style={{ backgroundColor: 'var(--lightblue-400)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">Welcome back</span>
          </div>
          <h1 className="text-2xl font-bold font-poppins mb-1">
            Exam Paper Generator
          </h1>
          <p className="text-sm opacity-70">
            Principal: <span className="font-mono">{shortPrincipal || 'Loading...'}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Subjects"
          count={subjectsLoading ? '...' : subjects.length}
          icon={<img src="/assets/generated/icon-subjects.dim_48x48.png" alt="Subjects" className="w-8 h-8 object-contain" />}
          gradientClass="stats-gradient-blue"
        />
        <StatsCard
          title="Total Questions"
          count={questionsLoading ? '...' : questions.length}
          icon={<img src="/assets/generated/icon-questions.dim_48x48.png" alt="Questions" className="w-8 h-8 object-contain" />}
          gradientClass="stats-gradient-teal"
        />
        <StatsCard
          title="Papers Generated"
          count={papersLoading ? '...' : papers.length}
          icon={<img src="/assets/generated/icon-paper-count.dim_48x48.png" alt="Papers" className="w-8 h-8 object-contain" />}
          gradientClass="stats-gradient-indigo"
        />
      </div>

      {/* System Overview */}
      <div className="academic-card">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--navy-100)' }}
          >
            <BookOpen className="w-4 h-4" style={{ color: 'var(--navy-700)' }} />
          </div>
          <h2 className="text-lg font-semibold font-poppins text-foreground">
            System Overview
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          ExamCraft helps you manage your question bank and generate multiple variants of exam papers automatically.
          Follow the workflow below to get started.
        </p>
        <WorkflowDiagram />
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="academic-card">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-5 h-5" style={{ color: 'var(--navy-600)' }} />
            <h3 className="font-semibold font-poppins text-foreground">Question Distribution</h3>
          </div>
          {questionsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions added yet. Start by adding questions to your bank.</p>
          ) : (
            <div className="space-y-2">
              {[
                { label: 'MCQ (1 Mark)', cat: 'mcqOneMark' },
                { label: '2 Mark Questions', cat: '_2Marks' },
                { label: '4 Mark Questions', cat: '_4Marks' },
                { label: '6 Mark Questions', cat: '_6Marks' },
                { label: '8 Mark Questions', cat: '_8Marks' },
              ].map(({ label, cat }) => {
                const count = questions.filter((q) => q.category === cat).length;
                const pct = questions.length > 0 ? Math.round((count / questions.length) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{label}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: 'var(--navy-500)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="academic-card">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5" style={{ color: 'var(--navy-600)' }} />
            <h3 className="font-semibold font-poppins text-foreground">Recent Papers</h3>
          </div>
          {papersLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : papers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No papers generated yet. Use the Generate Paper section to create your first exam.</p>
          ) : (
            <div className="space-y-3">
              {[...papers]
                .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
                .slice(0, 4)
                .map((paper) => (
                  <div key={String(paper.id)} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{paper.subjectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(paper.createdAt) / 1_000_000).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ backgroundColor: 'var(--navy-100)', color: 'var(--navy-700)' }}
                    >
                      {String(paper.totalMarks)} marks
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
