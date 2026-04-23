import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CaretDown as ChevronDown, Copy, ArrowsClockwise as RefreshCw, X, Clock, WarningCircle as AlertTriangle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  created_at: string;
  expires_at: string;
  used: boolean;
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
  department_director: 'Dept. Director',
  master_admin: 'Master Admin',
};

export const PendingInvitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_tokens')
        .select('*')
        .eq('used', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/register/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  const cancelInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invitation_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Invitation cancelled');
      fetchInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      // Update expires_at to extend by 7 days
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);

      const { error } = await supabase
        .from('invitation_tokens')
        .update({ expires_at: newExpiry.toISOString() })
        .eq('id', invitation.id);

      if (error) throw error;
      
      toast.success('Invitation extended and resent');
      // In production, you'd also resend the email here
      fetchInvitations();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    }
  };

  const getDaysPending = (createdAt: string) => {
    return differenceInDays(new Date(), new Date(createdAt));
  };

  const isOverdue = (createdAt: string) => {
    return getDaysPending(createdAt) > 7;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-card rounded-xl overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-foreground">
                Pending Invitations
              </h3>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">
                {invitations.length}
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Days Pending</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => {
                const daysPending = getDaysPending(invitation.created_at);
                const overdue = isOverdue(invitation.created_at);
                const expired = isExpired(invitation.expires_at);

                return (
                  <TableRow
                    key={invitation.id}
                    className={cn(
                      "border-border/50",
                      overdue && "bg-orange-500/5",
                      expired && "bg-red-500/5"
                    )}
                  >
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('border', ROLE_COLORS[invitation.role])}
                      >
                        {ROLE_LABELS[invitation.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium",
                            overdue ? "text-orange-500" : "text-foreground"
                          )}
                        >
                          {daysPending}
                        </span>
                        {overdue && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      {expired ? (
                        <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/30">
                          Expired
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => resendInvitation(invitation)}
                          title="Resend invitation"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyLink(invitation.token)}
                          title="Copy invitation link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => cancelInvitation(invitation.id)}
                          title="Cancel invitation"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
