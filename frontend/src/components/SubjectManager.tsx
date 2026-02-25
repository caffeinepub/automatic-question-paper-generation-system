import { useState } from 'react';
import { useGetSubjects, useAddSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useQueries';
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
import { PlusCircle, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Subject } from '../backend';

export default function SubjectManager() {
  const { data: subjects = [], isLoading } = useGetSubjects();
  const addSubject = useAddSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState({ id: '', name: '', code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setForm({ id: '', name: '', code: '' });
    setError('');
    setSuccess('');
    setShowAddForm(false);
    setEditingSubject(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.id.trim() || !form.name.trim() || !form.code.trim()) {
      setError('All fields are required.');
      return;
    }
    try {
      await addSubject.mutateAsync({ id: form.id.trim(), name: form.name.trim(), code: form.code.trim() });
      setSuccess('Subject added successfully!');
      setForm({ id: '', name: '', code: '' });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to add subject.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editingSubject) return;
    if (!form.name.trim() || !form.code.trim()) {
      setError('Name and code are required.');
      return;
    }
    try {
      await updateSubject.mutateAsync({ id: editingSubject.id, name: form.name.trim(), code: form.code.trim() });
      setSuccess('Subject updated successfully!');
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update subject.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubject.mutateAsync(id);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete subject.');
    }
  };

  const startEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({ id: subject.id, name: subject.name, code: subject.code });
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-4">
      {/* Add Subject Button */}
      {!showAddForm && !editingSubject && (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Subject
        </button>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingSubject) && (
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <h3 className="font-semibold text-navy-800 mb-4">
            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <form onSubmit={editingSubject ? handleUpdate : handleAdd} className="space-y-3">
            {!editingSubject && (
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Subject ID *</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))}
                  placeholder="e.g., CS101"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Computer Science"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Subject Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="e.g., CS-101"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-3 py-2 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addSubject.isPending || updateSubject.isPending}
                className="bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                {(addSubject.isPending || updateSubject.isPending) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingSubject ? 'Update Subject' : 'Add Subject'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subjects List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
          <div className="w-8 h-8 border-2 border-navy-300 border-t-navy-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">No subjects yet. Add your first subject above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-navy-800 text-sm">{subject.name}</span>
                  <span className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-lg">
                    {subject.code}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">ID: {subject.id}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(subject)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-navy-600 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{subject.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(subject.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
