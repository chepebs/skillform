import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Group } from '@/hooks/useOrganizerData';

interface DeleteGroupDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteGroupDialog: React.FC<DeleteGroupDialogProps> = ({
  group,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmed(false);
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Group</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete the group{' '}
              <strong className="text-foreground">"{group?.name}"</strong>?
            </p>
            <p>
              This will remove all {group?.member_count || 0} members from the group. The
              members themselves will not be deleted.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <Label htmlFor="confirm" className="text-sm">
            I understand this action cannot be undone
          </Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!confirmed || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Group'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
