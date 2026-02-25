import React from 'react';
import { Link } from '@tanstack/react-router';
import { useGetMyPapers } from '../hooks/useQueries';
import PaperCard from '../components/PaperCard';
import { FileText, Loader2, PlusCircle } from 'lucide-react';

export default function GeneratedPapers() {
  const { data: papers = [], isLoading } = useGetMyPapers();

  const sortedPapers = [...papers].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--navy-100)' }}
          >
            <FileText className="w-5 h-5" style={{ color: 'var(--navy-700)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-poppins text-foreground">Generated Papers</h1>
            <p className="text-sm text-muted-foreground">
              {papers.length} paper{papers.length !== 1 ? 's' : ''} generated
            </p>
          </div>
        </div>
        <Link
          to="/generate-paper"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: 'var(--navy-700)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
        >
          <PlusCircle className="w-4 h-4" />
          New Paper
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading papers...</span>
        </div>
      ) : sortedPapers.length === 0 ? (
        <div className="academic-card text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-base font-semibold font-poppins text-foreground mb-2">No Papers Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Generate your first exam paper to see it here.
          </p>
          <Link
            to="/generate-paper"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: 'var(--navy-700)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
          >
            <PlusCircle className="w-4 h-4" />
            Generate Paper
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedPapers.map((paper) => (
            <PaperCard key={String(paper.id)} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}
