import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Question, QuestionCategory, DifficultyLevel } from '../backend';
import { useState } from 'react';
import EditQuestionModal from './EditQuestionModal';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const categoryLabel = {
    [QuestionCategory._2Marks]: '2 Marks',
    [QuestionCategory._4Marks]: '4 Marks',
    [QuestionCategory.mcqOneMark]: '1 Mark',
    [QuestionCategory._6Marks]: '6 Marks',
    [QuestionCategory._8Marks]: '8 Marks',
  }[question.category];

  const difficultyColor = {
    [DifficultyLevel.easy]: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    [DifficultyLevel.medium]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    [DifficultyLevel.hard]: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }[question.difficultyLevel];

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-light-blue/10 text-light-blue border-light-blue">
                  {categoryLabel}
                </Badge>
                <Badge className={difficultyColor}>
                  {question.difficultyLevel}
                </Badge>
              </div>
              
              <p className="text-sm">{question.questionText}</p>
              
              {question.category === QuestionCategory.mcqOneMark && question.options && (
                <div className="text-xs space-y-1 pl-4 text-muted-foreground">
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                      <span>{option}</span>
                      {option === question.correctAnswer && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Correct
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditOpen(true)}
                className="hover:bg-light-blue/10 hover:text-light-blue"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditQuestionModal
        question={question}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}
