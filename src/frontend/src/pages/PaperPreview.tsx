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

  const sectionA = questions.filter((q: any) => q.category === QuestionCategory.mcq);
  const sectionB = questions.filter((q: any) => 
    q.category === QuestionCategory._2Marks || q.category === QuestionCategory._4Marks
  );
  const sectionC = questions.filter((q: any) => 
    q.category === QuestionCategory._6Marks || q.category === QuestionCategory._8Marks
  );

  const handleDownloadPDF = () => {
    try {
      generatePDF(paper, selectedVariant, { sectionA, sectionB, sectionC });
      toast.success('Opening print dialog...');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
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
              <CardContent className="p-8 space-y-8">
                {sectionA.length > 0 && (
                  <PaperSection
                    title="Section A - Multiple Choice Questions"
                    questions={sectionA}
                    startNumber={1}
                  />
                )}

                {sectionB.length > 0 && (
                  <PaperSection
                    title="Section B - Short Answer Questions"
                    questions={sectionB}
                    startNumber={sectionA.length + 1}
                  />
                )}

                {sectionC.length > 0 && (
                  <PaperSection
                    title="Section C - Long Answer Questions"
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
