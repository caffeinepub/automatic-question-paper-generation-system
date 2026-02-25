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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { PlusCircle, Edit2, Trash2, CheckCircle, AlertCircle, BookMarked } from 'lucide-react';
import { Subject } from '../backend';

export default function SubjectManager() {
  const { data: subjects = [], isLoading } = useGetSubjects();
  const addSubject = useAddSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [addForm, setAddForm] = useState({ name: '', code: '' });
  const [editForm, setEditForm] = useState({ name: '', code: '' });
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const resetAddForm = () => {
    setAddForm({ name: '', code: '' });
    setAddError('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!addForm.name.trim() || !addForm.code.trim()) {
      setAddError('All fields are required.');
      return;
    }
    try {
      await addSubject.mutateAsync({
        name: addForm.name.trim(),
        code: addForm.code.trim(),
      });
      resetAddForm();
      setShowAddDialog(false);
    } catch (err: any) {
      setAddError(err?.message ?? 'Failed to add subject.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editingSubject) return;
    if (!editForm.name.trim() || !editForm.code.trim()) {
      setEditError('Name and code are required.');
      return;
    }
    try {
      await updateSubject.mutateAsync({
        id: editingSubject.code,
        name: editForm.name.trim(),
        code: editForm.code.trim(),
      });
      setEditingSubject(null);
      setEditForm({ name: '', code: '' });
      setEditError('');
    } catch (err: any) {
      setEditError(err?.message ?? 'Failed to update subject.');
    }
  };

  const handleDelete = async (code: string) => {
    setDeleteError('');
    try {
      await deleteSubject.mutateAsync(code);
    } catch (err: any) {
      setDeleteError(err?.message ?? 'Failed to delete subject.');
    }
  };

  const startEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setEditForm({ name: subject.name, code: subject.code });
    setEditError('');
  };

  return (
    <div className="space-y-4">
      {/* Header row with Add Subject button always visible */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-navy-900 font-poppins">Subjects</h2>
          <p className="text-sm text-gray-500">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} in your bank
          </p>
        </div>
        <button
          onClick={() => {
            resetAddForm();
            setShowAddDialog(true);
          }}
          className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-navy-900/20"
        >
          <PlusCircle className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {/* Add Subject Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) resetAddForm();
        setShowAddDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy-900 font-poppins">Add New Subject</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Computer Science"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addForm.code}
                onChange={(e) => setAddForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g., CS-101"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>

            {addError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {addError}
              </div>
            )}

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <button
                  type="button"
                  className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="submit"
                disabled={addSubject.isPending}
                className="bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {addSubject.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Add Subject
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => {
        if (!open) {
          setEditingSubject(null);
          setEditForm({ name: '', code: '' });
          setEditError('');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy-900 font-poppins">Edit Subject</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Computer Science"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) => setEditForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g., CS-101"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>

            {editError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {editError}
              </div>
            )}

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <button
                  type="button"
                  className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="submit"
                disabled={updateSubject.isPending}
                className="bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {updateSubject.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Update Subject'
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete error */}
      {deleteError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {deleteError}
        </div>
      )}

      {/* Subjects List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
          <div className="w-8 h-8 border-2 border-navy-300 border-t-navy-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-card border border-gray-100 text-center">
          <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-navy-800 mb-1">No Subjects Yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Get started by adding your first subject using the button above.
          </p>
          <button
            onClick={() => {
              resetAddForm();
              setShowAddDialog(true);
            }}
            className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.code}
              className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-navy-800 text-sm">{subject.name}</span>
                  <span className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-lg font-medium">
                    {subject.code}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(subject)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-navy-600 transition-colors"
                  title="Edit subject"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete subject"
                    >
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
                        onClick={() => handleDelete(subject.code)}
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
