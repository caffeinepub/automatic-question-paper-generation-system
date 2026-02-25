import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useGetSubjects, useAddSubject, useDeleteSubject, useUpdateSubject } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function SubjectManager() {
  const { data: subjects = [], isLoading } = useGetSubjects();
  const addSubject = useAddSubject();
  const deleteSubject = useDeleteSubject();
  const updateSubject = useUpdateSubject();

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');

  const handleAdd = async () => {
    const name = newName.trim();
    const code = newCode.trim().toUpperCase();
    if (!name || !code) {
      toast.error('Please enter both subject name and code');
      return;
    }
    const id = code.toLowerCase().replace(/\s+/g, '-');
    try {
      await addSubject.mutateAsync({ id, name, code });
      setNewName('');
      setNewCode('');
      toast.success(`Subject "${name}" added successfully`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add subject');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteSubject.mutateAsync(id);
      toast.success(`Subject "${name}" deleted`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete subject');
    }
  };

  const startEdit = (id: string, name: string, code: string) => {
    setEditingId(id);
    setEditName(name);
    setEditCode(code);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const name = editName.trim();
    const code = editCode.trim().toUpperCase();
    if (!name || !code) {
      toast.error('Please enter both subject name and code');
      return;
    }
    try {
      await updateSubject.mutateAsync({ id: editingId, name, code });
      setEditingId(null);
      toast.success('Subject updated successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update subject');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Subject Form */}
      <div className="academic-card">
        <h3 className="text-sm font-semibold font-poppins text-foreground mb-4">Add New Subject</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Subject Name (e.g. Mathematics)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Code (e.g. MATH101)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-36 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={addSubject.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ backgroundColor: 'var(--navy-700)' }}
            onMouseEnter={(e) => !addSubject.isPending && (e.currentTarget.style.backgroundColor = 'var(--navy-800)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-700)')}
          >
            {addSubject.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Subject
          </button>
        </div>
      </div>

      {/* Subject List */}
      <div className="academic-card">
        <h3 className="text-sm font-semibold font-poppins text-foreground mb-4">
          Subjects ({subjects.length})
        </h3>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading subjects...
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No subjects added yet. Add your first subject above.
          </p>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
              >
                {editingId === subject.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="w-28 px-2 py-1 text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={handleUpdate}
                      disabled={updateSubject.isPending}
                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                    >
                      {updateSubject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{subject.name}</span>
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded font-mono"
                        style={{ backgroundColor: 'var(--navy-100)', color: 'var(--navy-700)' }}
                      >
                        {subject.code}
                      </span>
                    </div>
                    <button
                      onClick={() => startEdit(subject.id, subject.name, subject.code)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-muted"
                    >
                      <Edit2 className="w-4 h-4" style={{ color: 'var(--navy-600)' }} />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-1.5 rounded-lg transition-colors hover:bg-red-50">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{subject.name}"? All associated questions may be affected.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(subject.id, subject.name)}
                            disabled={deleteSubject.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteSubject.isPending ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
