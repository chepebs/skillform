import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CircleNotch as Loader2, Copy, Check } from '@phosphor-icons/react';

const addUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['employee', 'organizer_admin', 'department_director', 'master_admin']),
  department: z.string().optional(),
  sendInvitation: z.boolean().default(true),
  customMessage: z.string().optional(),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentUserId: string;
}

interface Department {
  id: string;
  name: string;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  currentUserId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: '',
      role: 'employee',
      department: '',
      sendInvitation: true,
      customMessage: '',
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoadingDepartments(true);
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
          .order('name');
        if (error) {
          console.error('Error fetching departments:', error);
        }
        if (data) setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setIsLoadingDepartments(false);
      }
    };
    if (open) fetchDepartments();
  }, [open]);

  const handleSubmit = async (data: AddUserFormData) => {
    setIsSubmitting(true);
    try {
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .single();

      if (existingProfile) {
        toast.error('A user with this email already exists');
        setIsSubmitting(false);
        return;
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('invitation_tokens')
        .select('email')
        .eq('email', data.email)
        .eq('used', false)
        .single();

      if (existingInvitation) {
        toast.error('An invitation has already been sent to this email');
        setIsSubmitting(false);
        return;
      }

      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invitation token
      const { error: tokenError } = await supabase.from('invitation_tokens').insert({
        email: data.email,
        token,
        role: data.role,
        expires_at: expiresAt.toISOString(),
      });

      if (tokenError) throw tokenError;

      // Log action
      await supabase.from('audit_log').insert({
        user_id: currentUserId,
        action: 'invitation_created',
        target_type: 'invitation',
        details: { email: data.email, role: data.role },
      });

      // Generate invitation link
      const link = `${window.location.origin}/register/${token}`;
      setInvitationLink(link);

      toast.success('Invitation created successfully');
      
      if (!data.sendInvitation) {
        // Show link for manual sharing
      } else {
        // In a real app, you would send an email here via Edge Function
        toast.info('Email invitation would be sent (email service not configured)');
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error('Failed to create invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success('Invitation link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    form.reset();
    setInvitationLink(null);
    setCopied(false);
    onOpenChange(false);
    if (invitationLink) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Send an invitation to add a new user to the system.
          </DialogDescription>
        </DialogHeader>

        {invitationLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                Invitation created successfully!
              </p>
              <p className="text-xs text-muted-foreground">
                Share this link with the user to complete their registration:
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={invitationLink}
                readOnly
                className="text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This link expires in 7 days.
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="organizer_admin">Organizer Admin</SelectItem>
                        <SelectItem value="department_director">Department Director</SelectItem>
                        <SelectItem value="master_admin">Master Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
              <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDepartments}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingDepartments ? "Loading departments..." : "Select a department"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.length === 0 && !isLoadingDepartments ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No departments available</div>
                        ) : (
                          departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendInvitation"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="cursor-pointer">
                        Send invitation email immediately
                      </FormLabel>
                      <FormDescription className="text-xs">
                        If unchecked, you'll receive a link to share manually
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a personal message to the invitation..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Invitation'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
