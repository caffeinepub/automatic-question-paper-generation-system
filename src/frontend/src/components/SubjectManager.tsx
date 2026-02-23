import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQueries } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function SubjectManager() {
  const { useGetAllSubjects, useAddSubject } = useQueries();
  const { data: subjects = [] } = useGetAllSubjects();
  const addSubjectMutation = useAddSubject();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.code) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addSubjectMutation.mutateAsync(formData);
      toast.success('Subject added successfully!');
      setFormData({ id: '', name: '', code: '' });
    } catch (error) {
      toast.error('Failed to add subject');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-navy">Add New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectId">Subject ID *</Label>
                <Input
                  id="subjectId"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g., CS101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name *</Label>
                <Input
                  id="subjectName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Discrete Mathematics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code *</Label>
                <Input
                  id="subjectCode"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., DM"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="bg-navy hover:bg-navy/90"
              disabled={addSubjectMutation.isPending}
            >
              {addSubjectMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-navy">Existing Subjects ({subjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No subjects added yet. Add your first subject above.
            </p>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="font-semibold text-navy">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {subject.id} | Code: {subject.code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-light-blue/10 hover:text-light-blue">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
