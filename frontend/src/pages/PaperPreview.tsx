import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllQuestions, useGetMyPapers } from '../hooks/useQueries';
import PaperSection from '../components/PaperSection';
import { generatePDF } from '../utils/pdfGenerator';
import { ArrowLeft, Download, Loader2, FileText } from 'lucide-react';
import type { Question, GeneratedPaper } from '../backend';

function toPDFQuestions(questions: Question[]) {
  return questions.map((q) => ({
    id: String(q.id),
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer,
    category: q.category,
  }));
}

export default function PaperPreview() {
  const { paperId } = useParams({ from: '/layout/paper-preview/$paperId' });
  const navigate = useNavigate();
  const [activeVariant, setActiveVariant] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: allPapers = [], isLoading: papersLoading } = useGetMyPapers();
  const { data: allQuestions = [], isLoading: questionsLoading } = useGetAllQuestions();

  const isLoading = papersLoading || questionsLoading;

  const paper: GeneratedPaper | undefined = allPapers.find(
    (p) => String(p.id) === paperId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading paper...</span>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="academic-card text-center py-16">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h3 className="text-base font-semibold font-poppins text-foreground mb-2">Paper Not Found</h3>
        <p className="text-sm text-muted-foreground mb-6">The requested paper could not be found.</p>
        <button
          onClick={() => navigate({ to: '/generated-papers' })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--navy-700)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Papers
        </button>
      </div>
    );
  }

  const questionMap = new Map<bigint, Question>(
    allQuestions.map((q) => [q.id, q])
  );

  const currentVariant = paper.setVariants?.[activeVariant];
  const variantQuestions: Question[] = (currentVariant?.questions ?? paper.questions ?? [])
    .map((id) => questionMap.get(id))
    .filter((q): q is Question => q !== undefined);

  // Group questions by category
  const mcqQuestions = variantQuestions.filter((q) => q.category === 'mcqOneMark');
  const twoMarkQuestions = variantQuestions.filter((q) => q.category === '_2Marks');
  const fourMarkQuestions = variantQuestions.filter((q) => q.category === '_4Marks');
  const sixMarkQuestions = variantQuestions.filter((q) => q.category === '_6Marks');
  const eightMarkQuestions = variantQuestions.filter((q) => q.category === '_8Marks');

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const variantLabel = currentVariant?.variant ?? 'A';
      const sections: Record<string, ReturnType<typeof toPDFQuestions>> = {
        mcqOneMark: toPDFQuestions(mcqQuestions),
        _2Marks: toPDFQuestions(twoMarkQuestions),
        _4Marks: toPDFQuestions(fourMarkQuestions),
        _6Marks: toPDFQuestions(sixMarkQuestions),
        _8Marks: toPDFQuestions(eightMarkQuestions),
      };
      generatePDF({
        subjectName: paper.subjectName,
        examDuration: Number(paper.examDuration),
        totalMarks: Number(paper.totalMarks),
        variant: variantLabel,
        sections,
        categoryLabel: (cat: string) => {
          const map: Record<string, string> = {
            mcqOneMark: 'Section A – MCQ (1 Mark Each)',
            _2Marks: 'Section B – Short Answer (2 Marks Each)',
            _4Marks: 'Section C – Short Answer (4 Marks Each)',
            _6Marks: 'Section D – Long Answer (6 Marks Each)',
            _8Marks: 'Section E – Long Answer (8 Marks Each)',
          };
          return map[cat] ?? cat;
        },
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate start numbers for each section
  const mcqStart = 1;
  const twoMarkStart = mcqStart + mcqQuestions.length;
  const fourMarkStart = twoMarkStart + twoMarkQuestions.length;
  const sixMarkStart = fourMarkStart + fourMarkQuestions.length;
  const eightMarkStart = sixMarkStart + sixMarkQuestions.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/generated-papers' })}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-poppins text-foreground">{paper.subjectName}</h1>
            <p className="text-sm text-muted-foreground">
              {String(paper.totalMarks)} marks · {String(paper.examDuration)} minutes
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ backgroundColor: 'var(--navy-700)' }}
          onMouseEnter={(e) => !isGeneratingPDF && (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Variant Tabs */}
      {paper.setVariants && paper.setVariants.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {paper.setVariants.map((variant, idx) => (
            <button
              key={variant.variant}
              onClick={() => setActiveVariant(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeVariant === idx
                  ? 'text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
              }`}
              style={activeVariant === idx ? { backgroundColor: 'var(--navy-700)' } : {}}
            >
              Set {variant.variant}
            </button>
          ))}
        </div>
      )}

      {/* Paper Content */}
      <div className="academic-card">
        {/* Paper Header */}
        <div
          className="text-center p-6 rounded-xl mb-6 text-white"
          style={{ backgroundColor: 'var(--navy-800)' }}
        >
          <div className="flex justify-center mb-3">
            <img
              src="/assets/generated/college-logo.dim_200x200.png"
              alt="College Logo"
              className="w-16 h-16 object-contain rounded-full bg-white/10 p-1"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h2 className="text-lg font-bold font-poppins mb-1">{paper.subjectName}</h2>
          <div className="flex items-center justify-center gap-6 text-sm opacity-80 mt-2">
            <span>Duration: {String(paper.examDuration)} min</span>
            <span>Total Marks: {String(paper.totalMarks)}</span>
            <span>Set: {currentVariant?.variant ?? 'A'}</span>
          </div>
        </div>

        {/* Sections */}
        {variantQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No questions found for this variant.
          </p>
        ) : (
          <div>
            <PaperSection
              title={`Section A – MCQ (1 Mark each) [${mcqQuestions.length} × 1 = ${mcqQuestions.length} Marks]`}
              questions={mcqQuestions}
              startNumber={mcqStart}
            />
            <PaperSection
              title={`Section B – Short Answer (2 Marks each) [${twoMarkQuestions.length} × 2 = ${twoMarkQuestions.length * 2} Marks]`}
              questions={twoMarkQuestions}
              startNumber={twoMarkStart}
            />
            <PaperSection
              title={`Section C – Medium Answer (4 Marks each) [${fourMarkQuestions.length} × 4 = ${fourMarkQuestions.length * 4} Marks]`}
              questions={fourMarkQuestions}
              startNumber={fourMarkStart}
            />
            <PaperSection
              title={`Section D – Long Answer (6 Marks each) [${sixMarkQuestions.length} × 6 = ${sixMarkQuestions.length * 6} Marks]`}
              questions={sixMarkQuestions}
              startNumber={sixMarkStart}
            />
            <PaperSection
              title={`Section E – Essay (8 Marks each) [${eightMarkQuestions.length} × 8 = ${eightMarkQuestions.length * 8} Marks]`}
              questions={eightMarkQuestions}
              startNumber={eightMarkStart}
            />
          </div>
        )}
      </div>
    </div>
  );
}
