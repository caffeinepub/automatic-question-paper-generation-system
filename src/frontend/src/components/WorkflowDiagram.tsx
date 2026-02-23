import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function WorkflowDiagram() {
  const stages = [
    { label: 'Subjects', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
    { label: 'Question Categories', color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' },
    { label: 'Stored Questions', color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
    { label: 'Paper Generation Engine', color: 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300' },
    { label: 'PDF Output', color: 'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-300' },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-navy">System Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`px-6 py-4 rounded-lg font-semibold text-center ${stage.color} shadow-sm`}>
                {stage.label}
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="h-6 w-6 text-navy" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
