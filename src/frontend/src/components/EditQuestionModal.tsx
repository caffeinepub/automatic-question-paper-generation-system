import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Question } from '../backend';

interface EditQuestionModalProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditQuestionModal({ question, isOpen, onClose }: EditQuestionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Question editing functionality will be available in a future update.
          </p>
          <p className="text-sm mt-2">Question ID: {question.id.toString()}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
