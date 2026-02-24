import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQueries } from '../hooks/useQueries';
import { toast } from 'sonner';
import { QuestionCategory } from '../backend';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { Loader2, AlertCircle } from 'lucide-react';

export default function GeneratePaper() {
  const { useGetAllSubjects, useGetAllQuestions } = useQueries();
  const { data: subjects = [] } = useGetAllSubjects();
  const questionsQuery = useGetAllQuestions();
  const { data: allQuestions = [], isLoading: isLoadingQuestions, isError: isQuestionsError, error: questionsError } = questionsQuery;
  const { actor } = useActor();
  const navigate = useNavigate();

  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    examDuration: '',
    totalMarks: '',
    count2Marks: '',
    count4Marks: '',
    countMCQ: '',
    count6Marks: '',
    count8Marks: ''
  });

  // Log questions data when it changes
  useEffect(() => {
    console.log('📊 GeneratePaper - Questions data:', {
      isLoading: isLoadingQuestions,
      isError: isQuestionsError,
      error: questionsError instanceof Error ? questionsError.message : questionsError,
      questionsCount: allQuestions.length,
      queryStatus: questionsQuery.status
    });

    if (allQuestions.length > 0) {
      console.log('✅ Questions available for paper generation:', {
        total: allQuestions.length,
        byCategory: {
          mcqOneMark: allQuestions.filter(q => q.category === QuestionCategory.mcqOneMark).length,
          _2Marks: allQuestions.filter(q => q.category === QuestionCategory._2Marks).length,
          _4Marks: allQuestions.filter(q => q.category === QuestionCategory._4Marks).length,
          _6Marks: allQuestions.filter(q => q.category === QuestionCategory._6Marks).length,
          _8Marks: allQuestions.filter(q => q.category === QuestionCategory._8Marks).length,
        }
      });
    }
  }, [allQuestions, isLoadingQuestions, isQuestionsError, questionsError, questionsQuery.status]);

  // Memoize the question counts to avoid recalculation
  const questionCounts = useMemo(() => ({
    [QuestionCategory._2Marks]: parseInt(formData.count2Marks) || 0,
    [QuestionCategory._4Marks]: parseInt(formData.count4Marks) || 0,
    [QuestionCategory.mcqOneMark]: parseInt(formData.countMCQ) || 0,
    [QuestionCategory._6Marks]: parseInt(formData.count6Marks) || 0,
    [QuestionCategory._8Marks]: parseInt(formData.count8Marks) || 0,
  }), [formData.count2Marks, formData.count4Marks, formData.countMCQ, formData.count6Marks, formData.count8Marks]);

  const handleGenerate = async () => {
    console.log('=== 📝 PAPER GENERATION STARTED ===');
    console.log('Form data:', formData);
    console.log('Question counts:', questionCounts);
    console.log('Selected subject:', formData.subjectId);

    if (!formData.subjectId || !formData.examDuration || !formData.totalMarks) {
      console.error('❌ Validation failed: Missing required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    if (!actor) {
      console.error('❌ Backend actor not initialized');
      toast.error('Backend not initialized. Please try refreshing the page.');
      return;
    }

    const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
    console.log('Total questions requested:', totalQuestions);
    
    if (totalQuestions === 0) {
      console.error('❌ No questions selected');
      toast.error('Please select at least one question');
      return;
    }

    setIsGenerating(true);

    try {
      console.log('📡 Fetching questions from backend for subject:', formData.subjectId);
      
      // Fetch questions for each category in parallel
      const questionPromises = Object.entries(questionCounts).map(async ([category, count]) => {
        if (count > 0) {
          console.log(`🔍 Fetching ${count} questions for category: ${category}`);
          try {
            const questions = await actor.getQuestionsBySubjectAndCategory(
              formData.subjectId,
              category as QuestionCategory
            );
            console.log(`✅ Received ${questions.length} questions for category: ${category}`);
            
            if (questions.length > 0) {
              console.log(`Sample question from ${category}:`, {
                id: questions[0].id.toString(),
                questionText: questions[0].questionText.substring(0, 50) + '...',
                subjectId: questions[0].subjectId
              });
            }
            
            return { category: category as QuestionCategory, questions, requestedCount: count };
          } catch (error) {
            console.error(`❌ Error fetching questions for category ${category}:`, error);
            throw error;
          }
        }
        return null;
      });

      const results = await Promise.all(questionPromises);
      const validResults = results.filter(r => r !== null);
      console.log('✅ Valid results count:', validResults.length);
      console.log('Results summary:', validResults.map(r => ({
        category: r!.category,
        available: r!.questions.length,
        requested: r!.requestedCount
      })));

      // Validate we have enough questions
      const insufficientCategories: string[] = [];
      for (const result of validResults) {
        if (result!.questions.length < result!.requestedCount) {
          const errorMsg = `Not enough questions in ${result!.category}. Available: ${result!.questions.length}, Requested: ${result!.requestedCount}`;
          console.error('❌', errorMsg);
          insufficientCategories.push(errorMsg);
        }
      }

      if (insufficientCategories.length > 0) {
        console.error('❌ Insufficient questions in categories:', insufficientCategories);
        toast.error(
          <div>
            <p className="font-semibold">Not enough questions available:</p>
            <ul className="list-disc list-inside mt-2">
              {insufficientCategories.map((msg, i) => (
                <li key={i} className="text-sm">{msg}</li>
              ))}
            </ul>
          </div>
        );
        setIsGenerating(false);
        return;
      }

      console.log('🎲 Selecting and shuffling questions...');
      
      // Randomly select questions for each category
      const selectedQuestions: any[] = [];
      for (const result of validResults) {
        const shuffled = [...result!.questions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, result!.requestedCount);
        selectedQuestions.push(...selected);
        console.log(`Selected ${selected.length} questions from ${result!.category}`);
      }
      
      console.log('✅ Total selected questions:', selectedQuestions.length);
      console.log('Selected questions structure:', selectedQuestions.map(q => ({ 
        id: q.id.toString(), 
        category: q.category,
        subjectId: q.subjectId
      })));

      console.log('🔀 Generating 5 variants (A-E)...');
      
      // Generate 5 variants with different question orders
      const variants = ['A', 'B', 'C', 'D', 'E'].map(variant => {
        const shuffledQuestions = [...selectedQuestions].sort(() => Math.random() - 0.5);
        console.log(`✅ Variant ${variant} created with ${shuffledQuestions.length} questions`);
        return {
          variant,
          questions: shuffledQuestions
        };
      });

      console.log('✅ All variants generated:', variants.map(v => ({ 
        variant: v.variant, 
        questionCount: v.questions.length 
      })));

      // Save to localStorage
      const subject = subjects.find(s => s.id === formData.subjectId);
      const paper = {
        id: Date.now().toString(),
        subjectId: formData.subjectId,
        subjectName: subject?.name || '',
        examDuration: parseInt(formData.examDuration),
        totalMarks: parseInt(formData.totalMarks),
        variants,
        createdAt: Date.now()
      };

      console.log('💾 Paper object created:', {
        id: paper.id,
        subjectId: paper.subjectId,
        subjectName: paper.subjectName,
        examDuration: paper.examDuration,
        totalMarks: paper.totalMarks,
        variantCount: paper.variants.length,
        createdAt: paper.createdAt
      });

      console.log('💾 Saving to localStorage with key: generatedPapers');
      
      try {
        const existingPapers = JSON.parse(localStorage.getItem('generatedPapers') || '[]');
        console.log('Existing papers count:', existingPapers.length);
        
        existingPapers.push(paper);
        localStorage.setItem('generatedPapers', JSON.stringify(existingPapers));
        
        // Verify the save
        const savedPapers = JSON.parse(localStorage.getItem('generatedPapers') || '[]');
        const savedPaper = savedPapers.find((p: any) => p.id === paper.id);
        
        if (!savedPaper) {
          throw new Error('Paper was not saved to localStorage correctly');
        }
        
        console.log('✅ Paper saved successfully. Verification:', {
          savedPaperId: savedPaper.id,
          hasVariants: savedPaper.variants && savedPaper.variants.length === 5,
          variantStructure: savedPaper.variants?.map((v: any) => ({ 
            variant: v.variant, 
            questionCount: v.questions?.length 
          }))
        });
        
      } catch (storageError) {
        console.error('❌ localStorage save error:', storageError);
        toast.error('Failed to save paper to storage');
        setIsGenerating(false);
        return;
      }

      console.log('✅ Paper generation completed successfully');
      toast.success('Question paper generated successfully! All 5 variants (A-E) are ready.');
      
      console.log('🔄 Attempting navigation to paper preview...');
      console.log('Navigation params:', { to: '/paper-preview/$id', params: { id: paper.id } });
      
      // Navigate to paper preview
      try {
        navigate({ 
          to: '/paper-preview/$id',
          params: { id: paper.id }
        });
        console.log('✅ Navigation call completed');
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        console.error('Error details:', {
          message: navError instanceof Error ? navError.message : 'Unknown error',
          stack: navError instanceof Error ? navError.stack : 'No stack trace'
        });
        toast.error('Paper generated but failed to navigate to preview. Please check Generated Papers page.');
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate paper';
      console.error('❌ Paper generation error:', error);
      console.error('Error details:', {
        message: errorMsg,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        errorType: typeof error
      });
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">Generate Question Paper</h1>
        <p className="text-muted-foreground">Create randomized question papers with multiple variants</p>
      </div>

      {isQuestionsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Questions</AlertTitle>
          <AlertDescription>
            Failed to load questions from backend: {questionsError instanceof Error ? questionsError.message : 'Unknown error'}
            <br />
            Please try refreshing the page or check if questions have been added to the system.
          </AlertDescription>
        </Alert>
      )}

      {isLoadingQuestions && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Loading Questions</AlertTitle>
          <AlertDescription>
            Fetching questions from the backend...
          </AlertDescription>
        </Alert>
      )}

      {!isLoadingQuestions && !isQuestionsError && allQuestions.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Questions Available</AlertTitle>
          <AlertDescription>
            No questions found in the system. Please add questions before generating a paper.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Paper Configuration</CardTitle>
          <CardDescription>Configure the exam paper details and question distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Exam Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 180"
                value={formData.examDuration}
                onChange={(e) => setFormData({ ...formData, examDuration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks">Total Marks *</Label>
              <Input
                id="marks"
                type="number"
                placeholder="e.g., 100"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Question Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mcq">MCQ (1 Mark each)</Label>
                <Input
                  id="mcq"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.countMCQ}
                  onChange={(e) => setFormData({ ...formData, countMCQ: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="2marks">2 Marks Questions</Label>
                <Input
                  id="2marks"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.count2Marks}
                  onChange={(e) => setFormData({ ...formData, count2Marks: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="4marks">4 Marks Questions</Label>
                <Input
                  id="4marks"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.count4Marks}
                  onChange={(e) => setFormData({ ...formData, count4Marks: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="6marks">6 Marks Questions</Label>
                <Input
                  id="6marks"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.count6Marks}
                  onChange={(e) => setFormData({ ...formData, count6Marks: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="8marks">8 Marks Questions</Label>
                <Input
                  id="8marks"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.count8Marks}
                  onChange={(e) => setFormData({ ...formData, count8Marks: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || isLoadingQuestions || allQuestions.length === 0}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Paper...
                </>
              ) : (
                'Generate Paper (5 Variants)'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
