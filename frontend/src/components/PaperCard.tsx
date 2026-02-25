import { useNavigate } from '@tanstack/react-router';
import { GeneratedPaper, Subject } from '../backend';
import { FileText, Clock, Award, Eye } from 'lucide-react';

interface PaperCardProps {
  paper: GeneratedPaper;
  subjects: Subject[];
}

export default function PaperCard({ paper, subjects }: PaperCardProps) {
  const navigate = useNavigate();
  const subject = subjects.find((s) => s.id === paper.subjectId);

  const createdDate = new Date(Number(paper.createdAt) / 1_000_000);
  const formattedDate = createdDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-navy-600" />
        </div>
        <span className="text-xs text-gray-400">{formattedDate}</span>
      </div>

      <h3 className="font-semibold text-navy-900 mb-1 line-clamp-1">{paper.subjectName}</h3>
      {subject && <p className="text-gray-400 text-xs mb-3">{subject.code}</p>}

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {Number(paper.examDuration)} min
        </span>
        <span className="flex items-center gap-1">
          <Award className="w-3 h-3" />
          {Number(paper.totalMarks)} marks
        </span>
      </div>

      <button
        onClick={() => navigate({ to: '/paper-preview', search: { paperId: String(paper.id) } })}
        className="w-full flex items-center justify-center gap-2 bg-navy-50 hover:bg-navy-100 text-navy-700 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        <Eye className="w-4 h-4" />
        View Paper
      </button>
    </div>
  );
}
