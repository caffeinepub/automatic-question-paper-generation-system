import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useGetPaper, useGetAllQuestions, useGetSubjects } from '../hooks/useQueries';
import PaperSection from '../components/PaperSection';
import { generatePDF } from '../utils/pdfGenerator';
import { Download, ArrowLeft, FileText } from 'lucide-react';
import { Question, QuestionCategory } from '../backend';

interface PDFQuestion {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  category: QuestionCategory;
}

function toPDFQuestions(questions: Question[]): PDFQuestion[] {
  return questions.map((q) => ({
    id: String(q.id),
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer,
    category: q.category,
  }));
}

export default function PaperPreview() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { paperId?: string };
  const paperId = search.paperId ? BigInt(search.paperId) : undefined;

  const { data: paper, isLoading: paperLoading } = useGetPaper(paperId);
  const { data: allQuestions = [] } = useGetAllQuestions();
  const { data: subjects = [] } = useGetSubjects();

  const [selectedVariant, setSelectedVariant] = useState('A');

  if (paperLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-navy-300 border-t-navy-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="font-semibold text-navy-800 mb-2">Paper Not Found</h3>
        <p className="text-gray-500 text-sm mb-4">The requested paper could not be found.</p>
        <button
          onClick={() => navigate({ to: '/generated-papers' })}
          className="bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          Back to Papers
        </button>
      </div>
    );
  }

  const subject = subjects.find((s) => s.id === paper.subjectId);
  const variantData = paper.setVariants.find((v) => v.variant === selectedVariant);
  const variantQuestionIds = variantData?.questions ?? paper.questions;

  const variantQuestions = variantQuestionIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);

  const mcqQuestions = variantQuestions.filter((q) => q.category === QuestionCategory.mcqOneMark);
  const twoMarkQuestions = variantQuestions.filter((q) => q.category === QuestionCategory._2Marks);
  const fourMarkQuestions = variantQuestions.filter((q) => q.category === QuestionCategory._4Marks);
  const sixMarkQuestions = variantQuestions.filter((q) => q.category === QuestionCategory._6Marks);
  const eightMarkQuestions = variantQuestions.filter((q) => q.category === QuestionCategory._8Marks);

  const sections = [
    { title: 'Section A – MCQ (1 Mark Each)', questions: mcqQuestions, marksPerQuestion: 1 },
    { title: 'Section B – Short Answer (2 Marks Each)', questions: twoMarkQuestions, marksPerQuestion: 2 },
    { title: 'Section C – Short Answer (4 Marks Each)', questions: fourMarkQuestions, marksPerQuestion: 4 },
    { title: 'Section D – Long Answer (6 Marks Each)', questions: sixMarkQuestions, marksPerQuestion: 6 },
    { title: 'Section E – Long Answer (8 Marks Each)', questions: eightMarkQuestions, marksPerQuestion: 8 },
  ].filter((s) => s.questions.length > 0);

  const handleDownloadPDF = () => {
    generatePDF({
      subjectName: paper.subjectName,
      subjectCode: subject?.code ?? '',
      examDuration: Number(paper.examDuration),
      totalMarks: Number(paper.totalMarks),
      variant: selectedVariant,
      sections: sections.map((s) => ({
        title: s.title,
        questions: toPDFQuestions(s.questions),
        marksPerQuestion: s.marksPerQuestion,
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/generated-papers' })}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy-900 font-poppins">{paper.subjectName}</h1>
            <p className="text-gray-500 text-sm">
              {Number(paper.examDuration)} min • {Number(paper.totalMarks)} marks
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Variant Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
        <h3 className="text-sm font-semibold text-navy-800 mb-3">Select Variant</h3>
        <div className="flex gap-2 flex-wrap">
          {paper.setVariants.map((v) => (
            <button
              key={v.variant}
              onClick={() => setSelectedVariant(v.variant)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors ${
                selectedVariant === v.variant
                  ? 'bg-navy-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v.variant}
            </button>
          ))}
        </div>
      </div>

      {/* Paper Content */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {/* Paper Header */}
        <div className="bg-navy-800 text-white p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src="/assets/generated/college-logo.dim_200x200.png"
              alt="College Logo"
              className="w-10 h-10 object-contain bg-white rounded-lg p-1"
            />
            <div>
              <h2 className="font-bold text-lg font-poppins">Examination Paper</h2>
              <p className="text-navy-200 text-sm">{paper.subjectName}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-sm text-navy-200">
            <span>Duration: {Number(paper.examDuration)} minutes</span>
            <span>Total Marks: {Number(paper.totalMarks)}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full font-bold text-white">
              SET {selectedVariant}
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-6">
          {sections.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No questions in this variant.</p>
          ) : (
            sections.map((section, idx) => (
              <PaperSection
                key={idx}
                title={section.title}
                questions={section.questions}
                marksPerQuestion={section.marksPerQuestion}
                startNumber={
                  sections
                    .slice(0, idx)
                    .reduce((acc, s) => acc + s.questions.length, 0) + 1
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
