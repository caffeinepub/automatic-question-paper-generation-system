import { useNavigate } from '@tanstack/react-router';
import { useGetSubjects, useGetMyPapers } from '../hooks/useQueries';
import PaperCard from '../components/PaperCard';
import { FileText, PlusCircle } from 'lucide-react';

export default function GeneratedPapers() {
  const navigate = useNavigate();
  const { data: subjects = [] } = useGetSubjects();
  const { data: papers = [], isLoading } = useGetMyPapers();

  const sortedPapers = [...papers].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-poppins">Generated Papers</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and download your previously generated exam papers
          </p>
        </div>
        <button
          onClick={() => navigate({ to: '/generate-paper' })}
          className="bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Generate New Paper
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
          <div className="w-8 h-8 border-2 border-navy-300 border-t-navy-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading papers...</p>
        </div>
      ) : sortedPapers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
          <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-navy-400" />
          </div>
          <h3 className="font-semibold text-navy-800 mb-2">No Papers Generated Yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Generate your first exam paper to see it here.
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
          {sortedPapers.map((paper) => (
            <PaperCard key={String(paper.id)} paper={paper} subjects={subjects} />
          ))}
        </div>
      )}
    </div>
  );
}
