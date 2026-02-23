import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  count: number;
  icon: string;
}

export default function StatsCard({ title, count, icon }: StatsCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <img src={icon} alt={title} className="h-8 w-8 opacity-70" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-navy">{count}</div>
      </CardContent>
    </Card>
  );
}
