import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaperCard from '../components/PaperCard';

export default function GeneratedPapers() {
  const [papers, setPapers] = useState<any[]>([]);

  useEffect(() => {
    const storedPapers = JSON.parse(localStorage.getItem('generatedPapers') || '[]');
    // Sort by newest first
    const sortedPapers = storedPapers.sort((a: any, b: any) => b.createdAt - a.createdAt);
    setPapers(sortedPapers);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">Generated Papers</h1>
        <p className="text-muted-foreground">View and download previously generated question papers</p>
      </div>

      {papers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg mb-2">No papers generated yet</p>
            <p className="text-sm">Generate your first question paper to see it here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}
