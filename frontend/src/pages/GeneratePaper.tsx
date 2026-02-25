import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetSubjects, useGetAllQuestions, useGeneratePaper } from '../hooks/useQueries';
import { Wand2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionCounts {
  mcq: number;
  twoMark: number;
  fourMark: number;
  sixMark: number;
  eightMark: number;
}

export default function GeneratePaper() {
  const navigate = useNavigate();
  const { data: subjects = [] } = useGetSubjects();
  const { data: questions = [], isLoading: questionsLoading } = useGetAllQuestions();
  const generatePaper = useGeneratePaper();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [duration, setDuration] = useState('180');
  const [counts, setCounts] = useState<QuestionCounts>({
    mcq: 10,
    twoMark: 5,
    fourMark: 3,
    sixMark: 2,
    eightMark: 1,
  });

  const subjectQuestions = questions.filter((q) => q.subjectId === selectedSubject);

  const availability = {
    mcq: subjectQuestions.filter((q) => q.category === 'mcqOneMark').length,
    twoMark: subjectQuestions.filter((q) => q.category === '_2Marks').length,
    fourMark: subjectQuestions.filter((q) => q.category === '_4Marks').length,
    sixMark: subjectQuestions.filter((q) => q.category === '_6Marks').length,
    eightMark: subjectQuestions.filter((q) => q.category === '_8Marks').length,
  };

  const totalMarks =
    counts.mcq * 1 +
    counts.twoMark * 2 +
    counts.fourMark * 4 +
    counts.sixMark * 6 +
    counts.eightMark * 8;

  const validationErrors: string[] = [];
  if (selectedSubject) {
    if (counts.mcq > availability.mcq) validationErrors.push(`MCQ: need ${counts.mcq}, have ${availability.mcq}`);
    if (counts.twoMark > availability.twoMark) validationErrors.push(`2-Mark: need ${counts.twoMark}, have ${availability.twoMark}`);
    if (counts.fourMark > availability.fourMark) validationErrors.push(`4-Mark: need ${counts.fourMark}, have ${availability.fourMark}`);
    if (counts.sixMark > availability.sixMark) validationErrors.push(`6-Mark: need ${counts.sixMark}, have ${availability.sixMark}`);
    if (counts.eightMark > availability.eightMark) validationErrors.push(`8-Mark: need ${counts.eightMark}, have ${availability.eightMark}`);
  }

  const canGenerate = selectedSubject && validationErrors.length === 0 && totalMarks > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    try {
      const paper = await generatePaper.mutateAsync({
        subjectId: selectedSubject,
        examDuration: BigInt(duration),
        totalMarks: BigInt(totalMarks),
        mcqCount: BigInt(counts.mcq),
        twoMarkCount: BigInt(counts.twoMark),
        fourMarkCount: BigInt(counts.fourMark),
        sixMarkCount: BigInt(counts.sixMark),
        eightMarkCount: BigInt(counts.eightMark),
      });
      if (paper) {
        toast.success('Paper generated successfully!');
        navigate({ to: '/paper-preview/$paperId', params: { paperId: String(paper.id) } });
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to generate paper');
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  const CountInput = ({
    label,
    field,
    available,
    marksEach,
  }: {
    label: string;
    field: keyof QuestionCounts;
    available: number;
    marksEach: number;
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          Available: {available} | {marksEach} mark{marksEach > 1 ? 's' : ''} each
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCounts((c) => ({ ...c, [field]: Math.max(0, c[field] - 1) }))}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-sm font-bold hover:bg-muted transition-colors"
        >
          −
        </button>
        <span
          className={`w-8 text-center text-sm font-semibold ${
            counts[field] > available ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {counts[field]}
        </span>
        <button
          onClick={() => setCounts((c) => ({ ...c, [field]: c[field] + 1 }))}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-sm font-bold hover:bg-muted transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--navy-100)' }}
        >
          <Wand2 className="w-5 h-5" style={{ color: 'var(--navy-700)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-poppins text-foreground">Generate Paper</h1>
          <p className="text-sm text-muted-foreground">Configure and generate exam paper variants</p>
        </div>
      </div>

      <div className="academic-card space-y-5">
        {/* Subject Selection */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a subject...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            Exam Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="30"
            max="300"
            className={inputClass}
          />
        </div>

        {/* Question Counts */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Question Counts
          </label>
          {questionsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading question availability...
            </div>
          ) : (
            <div className="space-y-2">
              <CountInput label="MCQ (1 Mark each)" field="mcq" available={availability.mcq} marksEach={1} />
              <CountInput label="2 Mark Questions" field="twoMark" available={availability.twoMark} marksEach={2} />
              <CountInput label="4 Mark Questions" field="fourMark" available={availability.fourMark} marksEach={4} />
              <CountInput label="6 Mark Questions" field="sixMark" available={availability.sixMark} marksEach={6} />
              <CountInput label="8 Mark Questions" field="eightMark" available={availability.eightMark} marksEach={8} />
            </div>
          )}
        </div>

        {/* Total Marks */}
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ backgroundColor: 'var(--navy-50)' }}
        >
          <span className="text-sm font-semibold text-foreground">Total Marks</span>
          <span className="text-xl font-bold font-poppins" style={{ color: 'var(--navy-700)' }}>
            {totalMarks}
          </span>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Insufficient Questions</span>
            </div>
            <ul className="space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-xs text-destructive">• {err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success indicator */}
        {canGenerate && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            Ready to generate {totalMarks}-mark paper
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || generatePaper.isPending}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--navy-700)' }}
          onMouseEnter={(e) => canGenerate && !generatePaper.isPending && (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
        >
          {generatePaper.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Paper...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Paper (5 Variants)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
