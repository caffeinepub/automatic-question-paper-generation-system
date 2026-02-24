import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaperSection from '../components/PaperSection';
import { generatePDF } from '../utils/pdfGenerator';
import { QuestionCategory } from '../backend';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PaperPreview() {
  const { id } = useParams({ from: '/paper-preview/$id' });
  const [paper, setPaper] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState('A');

  useEffect(() => {
    const papers = JSON.parse(localStorage.getItem('generatedPapers') || '[]');
    const foundPaper = papers.find((p: any) => p.id === id);
    if (foundPaper) {
      setPaper(foundPaper);
    }
  }, [id]);

  if (!paper) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Paper not found</p>
      </div>
    );
  }

  const currentVariant = paper.variants.find((v: any) => v.variant === selectedVariant);
  const questions = currentVariant?.questions || [];

  const sectionA = questions.filter((q: any) => q.category === QuestionCategory.mcqOneMark);
  const sectionB = questions.filter((q: any) => 
    q.category === QuestionCategory._2Marks || q.category === QuestionCategory._4Marks
  );
  const sectionC = questions.filter((q: any) => 
    q.category === QuestionCategory._6Marks || q.category === QuestionCategory._8Marks
  );

  const handleDownloadPDF = () => {
    try {
      // Validate data before generating PDF
      if (!paper || !selectedVariant) {
        toast.error('Paper data is missing');
        console.error('Missing paper or variant data', { paper, selectedVariant });
        return;
      }

      if (!currentVariant || !questions || questions.length === 0) {
        toast.error('No questions found for this variant');
        console.error('Missing questions for variant', { currentVariant, questions });
        return;
      }

      // Log data for debugging
      console.log('Generating PDF with data:', {
        paper: {
          subjectName: paper.subjectName,
          examDuration: paper.examDuration,
          totalMarks: paper.totalMarks
        },
        variant: selectedVariant,
        sections: {
          sectionA: sectionA.length,
          sectionB: sectionB.length,
          sectionC: sectionC.length
        }
      });

      generatePDF(
        {
          subjectName: paper.subjectName,
          examDuration: paper.examDuration,
          totalMarks: paper.totalMarks
        },
        selectedVariant,
        { sectionA, sectionB, sectionC }
      );
      
      toast.success('Opening print dialog...');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
      toast.error(errorMessage);
      console.error('PDF generation error:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Question Paper Preview</h1>
          <p className="text-muted-foreground">{paper.subjectName}</p>
        </div>
        <Button onClick={handleDownloadPDF} className="bg-navy hover:bg-navy/90">
          <Download className="mr-2 h-4 w-4" />
          Download PDF (Set {selectedVariant})
        </Button>
      </div>

      <Tabs value={selectedVariant} onValueChange={setSelectedVariant}>
        <TabsList className="grid w-full max-w-md grid-cols-5">
          {['A', 'B', 'C', 'D', 'E'].map((variant) => (
            <TabsTrigger key={variant} value={variant}>
              Set {variant}
            </TabsTrigger>
          ))}
        </TabsList>

        {['A', 'B', 'C', 'D', 'E'].map((variant) => (
          <TabsContent key={variant} value={variant} className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="text-center border-b bg-slate-50 dark:bg-slate-900">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-navy">Engineering College</h2>
                  <CardTitle className="text-xl">{paper.subjectName}</CardTitle>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Time: {paper.examDuration} minutes</span>
                    <span>Total Marks: {paper.totalMarks}</span>
                    <span>Set: {variant}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {sectionA.length > 0 && (
                  <PaperSection
                    title="Section A - Multiple Choice Questions (1 mark each)"
                    questions={sectionA}
                    startNumber={1}
                  />
                )}

                {sectionB.length > 0 && (
                  <PaperSection
                    title="Section B - Short Answer Questions (2 Marks & 4 Marks)"
                    questions={sectionB}
                    startNumber={sectionA.length + 1}
                  />
                )}

                {sectionC.length > 0 && (
                  <PaperSection
                    title="Section C - Long Answer Questions (6 Marks & 8 Marks)"
                    questions={sectionC}
                    startNumber={sectionA.length + sectionB.length + 1}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
