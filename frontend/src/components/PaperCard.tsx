import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Clock, Award, Calendar, Eye } from 'lucide-react';
import type { GeneratedPaper } from '../backend';

interface PaperCardProps {
  paper: GeneratedPaper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  const navigate = useNavigate();

  const createdDate = new Date(Number(paper.createdAt) / 1_000_000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="academic-card hover:shadow-card-hover transition-all duration-200 group">
      {/* Subject Name */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold font-poppins text-foreground group-hover:text-navy-700 transition-colors">
            {paper.subjectName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paper #{String(paper.id)}
          </p>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ backgroundColor: 'var(--navy-100)', color: 'var(--navy-700)' }}
        >
          {paper.setVariants?.length ?? 0} Sets
        </span>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="flex flex-col items-center p-2 rounded-lg" style={{ backgroundColor: 'var(--navy-50)' }}>
          <Clock className="w-4 h-4 mb-1" style={{ color: 'var(--navy-600)' }} />
          <span className="text-xs font-semibold text-foreground">{String(paper.examDuration)} min</span>
          <span className="text-xs text-muted-foreground">Duration</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg" style={{ backgroundColor: 'var(--navy-50)' }}>
          <Award className="w-4 h-4 mb-1" style={{ color: 'var(--navy-600)' }} />
          <span className="text-xs font-semibold text-foreground">{String(paper.totalMarks)}</span>
          <span className="text-xs text-muted-foreground">Marks</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg" style={{ backgroundColor: 'var(--navy-50)' }}>
          <Calendar className="w-4 h-4 mb-1" style={{ color: 'var(--navy-600)' }} />
          <span className="text-xs font-semibold text-foreground text-center leading-tight">{createdDate}</span>
          <span className="text-xs text-muted-foreground">Created</span>
        </div>
      </div>

      {/* View Button */}
      <button
        onClick={() => navigate({ to: '/paper-preview/$paperId', params: { paperId: String(paper.id) } })}
        className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 text-white"
        style={{ backgroundColor: 'var(--navy-700)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
      >
        <Eye className="w-4 h-4" />
        View Paper
      </button>
    </div>
  );
}
