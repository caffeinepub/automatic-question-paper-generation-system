import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useQueries } from '../hooks/useQueries';
import QuestionCard from '../components/QuestionCard';
import SubjectManager from '../components/SubjectManager';
import { QuestionCategory } from '../backend';

export default function QuestionBank() {
  const { useGetAllSubjects, useGetAllQuestions } = useQueries();
  const { data: subjects = [] } = useGetAllSubjects();
  const questionsQuery = useGetAllQuestions();
  const { data: allQuestions = [], isLoading, isError, error, refetch } = questionsQuery;
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Log query state changes
  useEffect(() => {
    console.log('📊 QuestionBank - Query state changed:', {
      isLoading,
      isError,
      error: error instanceof Error ? error.message : error,
      questionsCount: allQuestions.length,
      queryStatus: questionsQuery.status,
      isFetching: questionsQuery.isFetching,
      isRefetching: questionsQuery.isRefetching
    });
  }, [isLoading, isError, error, allQuestions.length, questionsQuery.status, questionsQuery.isFetching, questionsQuery.isRefetching]);

  // Log when questions data changes
  useEffect(() => {
    if (allQuestions.length > 0) {
      console.log('✅ Questions loaded in QuestionBank:', {
        total: allQuestions.length,
        byCategory: {
          mcqOneMark: allQuestions.filter(q => q.category === QuestionCategory.mcqOneMark).length,
          _2Marks: allQuestions.filter(q => q.category === QuestionCategory._2Marks).length,
          _4Marks: allQuestions.filter(q => q.category === QuestionCategory._4Marks).length,
          _6Marks: allQuestions.filter(q => q.category === QuestionCategory._6Marks).length,
          _8Marks: allQuestions.filter(q => q.category === QuestionCategory._8Marks).length,
        },
        bySubject: subjects.reduce((acc, subject) => {
          acc[subject.name] = allQuestions.filter(q => q.subjectId === subject.id).length;
          return acc;
        }, {} as Record<string, number>)
      });
    } else if (!isLoading && !isError) {
      console.warn('⚠️ No questions available in QuestionBank');
    }
  }, [allQuestions, isLoading, isError, subjects]);

  const filteredQuestions = selectedSubject 
    ? allQuestions.filter(q => q.subjectId === selectedSubject)
    : allQuestions;

  console.log('🔍 Filtered questions:', {
    selectedSubject,
    filteredCount: filteredQuestions.length,
    totalCount: allQuestions.length
  });

  const questionsByCategory = {
    [QuestionCategory._2Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._2Marks),
    [QuestionCategory._4Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._4Marks),
    [QuestionCategory.mcqOneMark]: filteredQuestions.filter(q => q.category === QuestionCategory.mcqOneMark),
    [QuestionCategory._6Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._6Marks),
    [QuestionCategory._8Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._8Marks),
  };

  const handleRetry = () => {
    console.log('🔄 Manual retry triggered');
    refetch();
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
              <AlertTitle>Error Loading Questions</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Failed to load questions: {error instanceof Error ? error.message : 'Unknown error'}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <Card>
              <CardContent className="py-8 space-y-4">
                <div className="text-center text-muted-foreground mb-4">
                  Loading questions...
                </div>
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

              {filteredQuestions.length === 0 && !isLoading && !isError && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">No questions found</p>
                    <p className="text-muted-foreground">
                      {selectedSubject 
                        ? 'No questions available for the selected subject. Try adding some questions first.'
                        : 'No questions available. Add some questions to get started.'}
                    </p>
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
