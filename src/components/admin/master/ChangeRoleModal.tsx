import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CircleNotch as Loader2, WarningCircle as AlertTriangle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface ChangeRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
  currentUserId: string;
}

const ROLE_COLORS: Record<string, string> = {
  employee: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  organizer_admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  department_director: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  master_admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const ROLE_LABELS: Record<string, string> = {
  employee: 'Employee',
  organizer_admin: 'Organizer Admin',
  department_director: 'Department Director',
  master_admin: 'Master Admin',
};

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess,
  currentUserId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState<string>(user?.role || 'user');

  React.useEffect(() => {
    if (user) setNewRole(user.role);
  }, [user]);

  const handleSubmit = async () => {
    if (!user || newRole === user.role) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // Update user role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as 'user' | 'manager' | 'manager' | 'admin' })
        .eq('user_id', user.user_id);

      if (error) throw error;

      // Log action
      await supabase.from('audit_log').insert({
        user_id: currentUserId,
        action: 'role_changed',
        target_type: 'user',
        target_id: user.user_id,
        details: {
          email: user.email,
          old_role: user.role,
          new_role: newRole,
        },
      });

      toast.success(`Role updated to ${ROLE_LABELS[newRole]}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  if (!user) return null;

  const isSelf = user.user_id === currentUserId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role and permissions for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Current Role */}
          <div>
            <Label className="text-muted-foreground text-sm">Current Role</Label>
            <div className="mt-1">
              <Badge
                variant="outline"
                className={cn('border', ROLE_COLORS[user.role])}
              >
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>

          {/* New Role */}
          <div>
            <Label>New Role</Label>
            <Select value={newRole} onValueChange={setNewRole} disabled={isSelf}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Employee</SelectItem>
                <SelectItem value="manager">Organizer Admin</SelectItem>
                <SelectItem value="manager">Department Director</SelectItem>
                <SelectItem value="admin">Master Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning for self */}
          {isSelf && (
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                You cannot change your own role. Another master admin must make this change.
              </p>
            </div>
          )}

          {/* Warning for role downgrade */}
          {!isSelf && user.role === 'admin' && newRole !== 'admin' && (
            <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Downgrading this user from Master Admin will remove their administrative access.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || newRole === user.role || isSelf}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
