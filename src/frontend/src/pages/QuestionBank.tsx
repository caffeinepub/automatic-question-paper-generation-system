import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueries } from '../hooks/useQueries';
import QuestionCard from '../components/QuestionCard';
import SubjectManager from '../components/SubjectManager';
import { QuestionCategory } from '../backend';

export default function QuestionBank() {
  const { useGetAllSubjects, useGetAllQuestions } = useQueries();
  const { data: subjects = [] } = useGetAllSubjects();
  const { data: allQuestions = [] } = useGetAllQuestions();
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const filteredQuestions = selectedSubject 
    ? allQuestions.filter(q => q.subjectId === selectedSubject)
    : allQuestions;

  const questionsByCategory = {
    [QuestionCategory._2Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._2Marks),
    [QuestionCategory._4Marks]: filteredQuestions.filter(q => q.category === QuestionCategory._4Marks),
    [QuestionCategory.mcq]: filteredQuestions.filter(q => q.category === QuestionCategory.mcq),
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

          <div className="space-y-6">
            {Object.entries(questionsByCategory).map(([category, questions]) => {
              const categoryLabel = {
                [QuestionCategory._2Marks]: '2 Marks',
                [QuestionCategory._4Marks]: '4 Marks',
                [QuestionCategory.mcq]: 'MCQ',
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

            {filteredQuestions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No questions found. Add some questions to get started.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
