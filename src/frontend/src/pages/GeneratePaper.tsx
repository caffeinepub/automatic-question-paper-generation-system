import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueries } from '../hooks/useQueries';
import { toast } from 'sonner';
import { QuestionCategory } from '../backend';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { Loader2 } from 'lucide-react';

export default function GeneratePaper() {
  const { useGetAllSubjects } = useQueries();
  const { data: subjects = [] } = useGetAllSubjects();
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

  // Memoize the question counts to avoid recalculation
  const questionCounts = useMemo(() => ({
    [QuestionCategory._2Marks]: parseInt(formData.count2Marks) || 0,
    [QuestionCategory._4Marks]: parseInt(formData.count4Marks) || 0,
    [QuestionCategory.mcqOneMark]: parseInt(formData.countMCQ) || 0,
    [QuestionCategory._6Marks]: parseInt(formData.count6Marks) || 0,
    [QuestionCategory._8Marks]: parseInt(formData.count8Marks) || 0,
  }), [formData.count2Marks, formData.count4Marks, formData.countMCQ, formData.count6Marks, formData.count8Marks]);

  const handleGenerate = async () => {
    if (!formData.subjectId || !formData.examDuration || !formData.totalMarks) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!actor) {
      toast.error('Backend not initialized');
      return;
    }

    const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
    if (totalQuestions === 0) {
      toast.error('Please select at least one question');
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch questions for each category in parallel
      const questionPromises = Object.entries(questionCounts).map(async ([category, count]) => {
        if (count > 0) {
          const questions = await actor.getQuestionsBySubjectAndCategory(
            formData.subjectId,
            category as QuestionCategory
          );
          return { category: category as QuestionCategory, questions, requestedCount: count };
        }
        return null;
      });

      const results = await Promise.all(questionPromises);
      const validResults = results.filter(r => r !== null);

      // Validate we have enough questions
      for (const result of validResults) {
        if (result!.questions.length < result!.requestedCount) {
          toast.error(
            `Not enough questions in ${result!.category}. Available: ${result!.questions.length}, Requested: ${result!.requestedCount}`
          );
          setIsGenerating(false);
          return;
        }
      }

      // Randomly select questions for each category
      const selectedQuestions: any[] = [];
      for (const result of validResults) {
        const shuffled = [...result!.questions].sort(() => Math.random() - 0.5);
        selectedQuestions.push(...shuffled.slice(0, result!.requestedCount));
      }

      // Generate 5 variants with different question orders
      const variants = ['A', 'B', 'C', 'D', 'E'].map(variant => {
        const shuffledQuestions = [...selectedQuestions].sort(() => Math.random() - 0.5);
        return {
          variant,
          questions: shuffledQuestions
        };
      });

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

      const existingPapers = JSON.parse(localStorage.getItem('generatedPapers') || '[]');
      existingPapers.push(paper);
      localStorage.setItem('generatedPapers', JSON.stringify(existingPapers));

      toast.success('Question paper generated successfully! All 5 variants (A-E) are ready.');
      
      // Navigate to paper preview
      navigate({ to: `/paper-preview/${paper.id}` });
    } catch (error) {
      toast.error('Failed to generate paper');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-navy">Generate Question Paper</CardTitle>
          <CardDescription>Configure paper settings and select question distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select 
              value={formData.subjectId} 
              onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
              disabled={isGenerating}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Exam Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.examDuration}
                onChange={(e) => setFormData({ ...formData, examDuration: e.target.value })}
                placeholder="e.g., 180"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks">Total Marks *</Label>
              <Input
                id="marks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                placeholder="e.g., 100"
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h3 className="font-semibold text-navy">Question Distribution</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count2">2 Marks Questions</Label>
                <Input
                  id="count2"
                  type="number"
                  min="0"
                  value={formData.count2Marks}
                  onChange={(e) => setFormData({ ...formData, count2Marks: e.target.value })}
                  placeholder="0"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="count4">4 Marks Questions</Label>
                <Input
                  id="count4"
                  type="number"
                  min="0"
                  value={formData.count4Marks}
                  onChange={(e) => setFormData({ ...formData, count4Marks: e.target.value })}
                  placeholder="0"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countMCQ">MCQ Questions (1 Mark each)</Label>
                <Input
                  id="countMCQ"
                  type="number"
                  min="0"
                  value={formData.countMCQ}
                  onChange={(e) => setFormData({ ...formData, countMCQ: e.target.value })}
                  placeholder="0"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="count6">6 Marks Questions</Label>
                <Input
                  id="count6"
                  type="number"
                  min="0"
                  value={formData.count6Marks}
                  onChange={(e) => setFormData({ ...formData, count6Marks: e.target.value })}
                  placeholder="0"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="count8">8 Marks Questions</Label>
                <Input
                  id="count8"
                  type="number"
                  min="0"
                  value={formData.count8Marks}
                  onChange={(e) => setFormData({ ...formData, count8Marks: e.target.value })}
                  placeholder="0"
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            className="w-full bg-navy hover:bg-navy/90"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Paper...
              </>
            ) : (
              'Generate Paper'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
