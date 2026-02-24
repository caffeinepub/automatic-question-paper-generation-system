import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useQueries } from '../hooks/useQueries';
import QuestionCard from '../components/QuestionCard';
import SubjectManager from '../components/SubjectManager';
import { QuestionCategory } from '../backend';

export default function QuestionBank() {
  const { useGetAllSubjects, useGetAllQuestions } = useQueries();
  const { data: subjects = [] } = useGetAllSubjects();
  const { data: allQuestions = [], isLoading, isError, error } = useGetAllQuestions();
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const filteredQuestions = selectedSubject 
    ? allQuestions.filter(q => q.subjectId === selectedSubject)
    : allQuestions;

  const questionsByCategory = {
    [QuestionCategory._2Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._2Marks),
    [QuestionCategory._4Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._4Marks),
    [QuestionCategory.mcqOneMark]: filteredQuestions.filter(q => q.category === QuestionCategory.mcqOneMark),
    [QuestionCategory._6Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._6Marks),
    [QuestionCategory._8Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._8Marks),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">Question Bank</h1>
        <p className="text-muted-foreground">Manage subjects and questions</p>
      </div>

      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubject('')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedSubject === '' 
                      ? 'bg-navy text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All Subjects
                </button>
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedSubject === subject.id 
                        ? 'bg-navy text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load questions: {error instanceof Error ? error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <Card>
              <CardContent className="py-8 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(questionsByCategory).map(([category, questions]) => {
                const categoryLabel = {
                  [QuestionCategory._2Marks]: '2 Marks',
                  [QuestionCategory._4Marks]: '4 Marks',
                  [QuestionCategory.mcqOneMark]: 'MCQ (1 Mark)',
                  [QuestionCategory._6Marks]: '6 Marks',
                  [QuestionCategory._8Marks]: '8 Marks',
                }[category as QuestionCategory];

                if (questions.length === 0) return null;

                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-xl">{categoryLabel} Questions ({questions.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {questions.map((question) => (
                        <QuestionCard key={question.id.toString()} question={question} />
                      ))}
                    </CardContent>
                  </Card>
                );
              })}

              {filteredQuestions.length === 0 && !isLoading && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No questions found. Add some questions to get started.
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
