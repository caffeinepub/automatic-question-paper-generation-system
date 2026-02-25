import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetSubjects, useGetAllQuestions, useGetMyPapers } from '../hooks/useQueries';
import StatsCard from '../components/StatsCard';
import WorkflowDiagram from '../components/WorkflowDiagram';
import PaperCard from '../components/PaperCard';
import { PlusCircle, FileText, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: subjects = [] } = useGetSubjects();
  const { data: questions = [] } = useGetAllQuestions();
  const { data: papers = [] } = useGetMyPapers();

  const principalId = identity?.getPrincipal().toString() ?? '';
  const shortPrincipal = principalId ? `${principalId.slice(0, 8)}...` : '';

  const recentPapers = [...papers]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-poppins mb-1">Welcome to ExamCraft</h1>
            <p className="text-navy-200 text-sm">
              {shortPrincipal ? `Logged in as ${shortPrincipal}` : 'Manage your question bank and generate exam papers'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate({ to: '/add-question' })}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Question
            </button>
            <button
              onClick={() => navigate({ to: '/generate-paper' })}
              className="bg-lightblue-500 hover:bg-lightblue-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Generate Paper
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Subjects"
          count={subjects.length}
          icon="/assets/generated/icon-subjects.dim_48x48.png"
          gradient="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Total Questions"
          count={questions.length}
          icon="/assets/generated/icon-questions.dim_48x48.png"
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatsCard
          title="Papers Generated"
          count={papers.length}
          icon="/assets/generated/icon-paper-count.dim_48x48.png"
          gradient="from-navy-600 to-navy-700"
        />
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="text-lg font-bold text-navy-900 font-poppins mb-4">How ExamCraft Works</h2>
        <WorkflowDiagram />
      </div>

      {/* Recent Papers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-900 font-poppins">Recent Papers</h2>
          {papers.length > 0 && (
            <button
              onClick={() => navigate({ to: '/generated-papers' })}
              className="text-lightblue-600 hover:text-lightblue-700 text-sm font-medium"
            >
              View all →
            </button>
          )}
        </div>

        {recentPapers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
            <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-navy-400" />
            </div>
            <h3 className="font-semibold text-navy-800 mb-2">No Papers Yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Start by adding questions to your bank, then generate your first exam paper.
            </p>
            <button
              onClick={() => navigate({ to: '/generate-paper' })}
              className="bg-navy-800 hover:bg-navy-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Generate First Paper
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPapers.map((paper) => (
              <PaperCard key={String(paper.id)} paper={paper} subjects={subjects} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
