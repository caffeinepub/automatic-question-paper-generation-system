import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQueries } from '../hooks/useQueries';
import { toast } from 'sonner';
import { DifficultyLevel, QuestionCategory } from '../backend';

export default function AddQuestion() {
  const { useGetAllSubjects, useAddQuestion } = useQueries();
  const { data: subjects = [] } = useGetAllSubjects();
  const addQuestionMutation = useAddQuestion();

  const [formData, setFormData] = useState({
    subjectId: '',
    category: '' as QuestionCategory | '',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    difficultyLevel: '' as DifficultyLevel | ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectId || !formData.category || !formData.questionText || !formData.difficultyLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.category === QuestionCategory.mcq) {
      if (!formData.option1 || !formData.option2 || !formData.option3 || !formData.option4 || !formData.correctAnswer) {
        toast.error('Please fill in all MCQ options and select the correct answer');
        return;
      }
    }

    const options = formData.category === QuestionCategory.mcq 
      ? [formData.option1, formData.option2, formData.option3, formData.option4]
      : null;

    const correctAnswer = formData.category === QuestionCategory.mcq 
      ? formData.correctAnswer 
      : null;

    try {
      await addQuestionMutation.mutateAsync({
        subjectId: formData.subjectId,
        category: formData.category,
        questionText: formData.questionText,
        options,
        correctAnswer,
        difficultyLevel: formData.difficultyLevel
      });

      toast.success('Question added successfully!');
      
      // Reset form
      setFormData({
        subjectId: '',
        category: '' as QuestionCategory | '',
        questionText: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: '',
        difficultyLevel: '' as DifficultyLevel | ''
      });
    } catch (error) {
      toast.error('Failed to add question');
      console.error(error);
    }
  };

  const isMCQ = formData.category === QuestionCategory.mcq;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-navy">Add New Question</CardTitle>
          <CardDescription>Fill in the details to add a question to the database</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
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

            <div className="space-y-2">
              <Label htmlFor="category">Question Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as QuestionCategory })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionCategory._2Marks}>2 Marks</SelectItem>
                  <SelectItem value={QuestionCategory._4Marks}>4 Marks</SelectItem>
                  <SelectItem value={QuestionCategory.mcq}>MCQ</SelectItem>
                  <SelectItem value={QuestionCategory._6Marks}>6 Marks</SelectItem>
                  <SelectItem value={QuestionCategory._8Marks}>8 Marks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                placeholder="Enter the question text"
                rows={4}
                className="resize-none"
              />
            </div>

            {isMCQ && (
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h3 className="font-semibold text-navy">MCQ Options</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="option1">Option 1 *</Label>
                  <Input
                    id="option1"
                    value={formData.option1}
                    onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                    placeholder="Enter option 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="option2">Option 2 *</Label>
                  <Input
                    id="option2"
                    value={formData.option2}
                    onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                    placeholder="Enter option 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="option3">Option 3 *</Label>
                  <Input
                    id="option3"
                    value={formData.option3}
                    onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                    placeholder="Enter option 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="option4">Option 4 *</Label>
                  <Input
                    id="option4"
                    value={formData.option4}
                    onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                    placeholder="Enter option 4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer *</Label>
                  <Select value={formData.correctAnswer} onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}>
                    <SelectTrigger id="correctAnswer">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.option1 && <SelectItem value={formData.option1}>Option 1: {formData.option1}</SelectItem>}
                      {formData.option2 && <SelectItem value={formData.option2}>Option 2: {formData.option2}</SelectItem>}
                      {formData.option3 && <SelectItem value={formData.option3}>Option 3: {formData.option3}</SelectItem>}
                      {formData.option4 && <SelectItem value={formData.option4}>Option 4: {formData.option4}</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value as DifficultyLevel })}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DifficultyLevel.easy}>Easy</SelectItem>
                  <SelectItem value={DifficultyLevel.medium}>Medium</SelectItem>
                  <SelectItem value={DifficultyLevel.hard}>Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-navy hover:bg-navy/90"
              disabled={addQuestionMutation.isPending}
            >
              {addQuestionMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save to Database'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
