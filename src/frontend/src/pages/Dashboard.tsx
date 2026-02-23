import { useInternetIdentity } from '../hooks/useInternetIdentity';
import StatsCard from '../components/StatsCard';
import WorkflowDiagram from '../components/WorkflowDiagram';
import { useQueries } from '../hooks/useQueries';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { useGetAllSubjects, useGetAllQuestions, useGetGeneratedPapersCount } = useQueries();
  
  const { data: subjects = [] } = useGetAllSubjects();
  const { data: questions = [] } = useGetAllQuestions();
  const papersCount = useGetGeneratedPapersCount();

  const principal = identity?.getPrincipal().toString() || '';
  const shortPrincipal = principal.slice(0, 8) + '...' + principal.slice(-6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">Welcome, Teacher</h1>
        <p className="text-muted-foreground">Principal ID: {shortPrincipal}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Subjects"
          count={subjects.length}
          icon="/assets/generated/icon-subjects.dim_48x48.png"
        />
        <StatsCard
          title="Total Questions"
          count={questions.length}
          icon="/assets/generated/icon-questions.dim_48x48.png"
        />
        <StatsCard
          title="Papers Generated"
          count={papersCount}
          icon="/assets/generated/icon-paper-count.dim_48x48.png"
        />
      </div>

      <WorkflowDiagram />
    </div>
  );
}
