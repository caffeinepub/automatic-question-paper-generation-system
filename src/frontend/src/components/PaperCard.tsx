import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Eye, Calendar, Clock, Award } from 'lucide-react';

interface PaperCardProps {
  paper: any;
}

export default function PaperCard({ paper }: PaperCardProps) {
  const navigate = useNavigate();
  const date = new Date(paper.createdAt);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-slate-50 dark:bg-slate-900">
        <CardTitle className="text-lg text-navy">{paper.subjectName}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{paper.examDuration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>{paper.totalMarks} marks</span>
          </div>
        </div>
        
        <Button
          onClick={() => navigate({ to: `/paper-preview/${paper.id}` })}
          className="w-full bg-navy hover:bg-navy/90"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Paper
        </Button>
      </CardContent>
    </Card>
  );
}
