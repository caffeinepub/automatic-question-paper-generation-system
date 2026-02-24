import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaperSection from '../components/PaperSection';
import { generatePDF } from '../utils/pdfGenerator';
import { QuestionCategory } from '../backend';
import { Download, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function PaperPreview() {
  const params = useParams({ from: '/paper-preview/$id' });
  const navigate = useNavigate();
  const [paper, setPaper] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState('A');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== PAPER PREVIEW LOADING ===');
    console.log('Paper ID from params:', params.id);
    console.log('Full params object:', params);
    
    try {
      const papersJson = localStorage.getItem('generatedPapers');
      console.log('Raw localStorage data exists:', !!papersJson);
      
      if (!papersJson) {
        console.error('❌ No papers found in localStorage');
        toast.error('No papers found in storage');
        setIsLoading(false);
        return;
      }
      
      const papers = JSON.parse(papersJson);
      console.log('📊 Total papers in storage:', papers.length);
      console.log('📋 All paper IDs:', papers.map((p: any) => p.id));
      
      const foundPaper = papers.find((p: any) => p.id === params.id);
      
      if (foundPaper) {
        console.log('✅ Paper found:', {
          id: foundPaper.id,
          subjectName: foundPaper.subjectName,
          variantCount: foundPaper.variants?.length,
          variants: foundPaper.variants?.map((v: any) => ({
            variant: v.variant,
            questionCount: v.questions?.length
          }))
        });
        
        // Validate paper structure
        if (!foundPaper.variants || foundPaper.variants.length !== 5) {
          console.error('❌ Invalid paper structure: missing or incomplete variants');
          console.error('Variants found:', foundPaper.variants?.length || 0);
          toast.error('Paper data is corrupted - missing variants');
          setIsLoading(false);
          return;
        }
        
        // Validate each variant has questions
        let hasInvalidVariant = false;
        for (const variant of foundPaper.variants) {
          if (!variant.questions || variant.questions.length === 0) {
            console.error(`❌ Variant ${variant.variant} has no questions`);
            toast.error(`Variant ${variant.variant} is missing questions`);
            hasInvalidVariant = true;
          }
        }
        
        if (hasInvalidVariant) {
          setIsLoading(false);
          return;
        }
        
        setPaper(foundPaper);
        console.log('✅ Paper loaded successfully into state');
      } else {
        console.error('❌ Paper not found with ID:', params.id);
        console.error('Available IDs:', papers.map((p: any) => p.id));
        toast.error(`Paper not found with ID: ${params.id}`);
      }
    } catch (error) {
      console.error('❌ Error loading paper from localStorage:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to load paper data');
    } finally {
      setIsLoading(false);
    }
    
    console.log('=== PAPER PREVIEW LOADING COMPLETE ===');
  }, [params.id]);

  useEffect(() => {
    if (paper) {
      console.log('📄 Paper state updated:', {
        id: paper.id,
        hasVariants: !!paper.variants,
        variantCount: paper.variants?.length
      });
    }
  }, [paper]);

  if (isLoading) {
    console.log('⏳ Rendering: Loading state');
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading paper...</p>
      </div>
    );
  }

  if (!paper) {
    console.log('❌ Rendering: Paper not found state');
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Paper not found</p>
        <Button onClick={() => navigate({ to: '/generated-papers' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Generated Papers
        </Button>
      </div>
    );
  }

  const currentVariant = paper.variants.find((v: any) => v.variant === selectedVariant);
  
  if (!currentVariant) {
    console.error('❌ Current variant not found:', selectedVariant);
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Variant {selectedVariant} not found</p>
      </div>
    );
  }
  
  const questions = currentVariant.questions || [];
  console.log(`📝 Displaying variant ${selectedVariant} with ${questions.length} questions`);

  const sectionA = questions.filter((q: any) => q.category === QuestionCategory.mcqOneMark);
  const sectionB = questions.filter((q: any) => 
    q.category === QuestionCategory._2Marks || q.category === QuestionCategory._4Marks
  );
  const sectionC = questions.filter((q: any) => 
    q.category === QuestionCategory._6Marks || q.category === QuestionCategory._8Marks
  );

  console.log('📊 Section breakdown:', {
    sectionA: sectionA.length,
    sectionB: sectionB.length,
    sectionC: sectionC.length
  });

  const handleDownloadPDF = () => {
    console.log('=== PDF GENERATION STARTED ===');
    
    try {
      // Validate data before generating PDF
      if (!paper || !selectedVariant) {
        console.error('❌ Missing paper or variant data', { paper: !!paper, selectedVariant });
        toast.error('Paper data is missing');
        return;
      }

      if (!currentVariant || !questions || questions.length === 0) {
        console.error('❌ Missing questions for variant', { 
          hasVariant: !!currentVariant, 
          questionCount: questions?.length || 0 
        });
        toast.error('No questions available for this variant');
        return;
      }

      console.log('📄 Generating PDF for:', {
        subject: paper.subjectName,
        variant: selectedVariant,
        questionCount: questions.length
      });

      // Prepare sections for PDF generation
      const sections = {
        sectionA,
        sectionB,
        sectionC
      };

      generatePDF(paper, selectedVariant, sections);
      console.log('✅ PDF generation completed');
      toast.success(`PDF for variant ${selectedVariant} generated successfully`);
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">{paper.subjectName}</h1>
          <p className="text-muted-foreground">
            Duration: {paper.examDuration} minutes | Total Marks: {paper.totalMarks}
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/generated-papers' })} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question Paper Preview</CardTitle>
            <Button onClick={handleDownloadPDF} className="bg-navy hover:bg-navy/90">
              <Download className="mr-2 h-4 w-4" />
              Download Variant {selectedVariant}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedVariant} onValueChange={setSelectedVariant}>
            <TabsList className="grid w-full grid-cols-5">
              {paper.variants.map((v: any) => (
                <TabsTrigger key={v.variant} value={v.variant}>
                  Variant {v.variant}
                </TabsTrigger>
              ))}
            </TabsList>

            {paper.variants.map((v: any) => (
              <TabsContent key={v.variant} value={v.variant} className="space-y-6 mt-6">
                {sectionA.length > 0 && (
                  <PaperSection
                    title="Section A - Multiple Choice Questions (1 mark each)"
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

                {sectionA.length === 0 && sectionB.length === 0 && sectionC.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions available for this variant
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
