import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';


import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import { toast } from 'sonner';
import { SectionAdornment } from '@/components/brand/SectionAdornment';

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

type ThemeChoice = 'light' | 'dark';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const theme = (localStorage.getItem('theme') === 'light' ? 'light' : 'dark') as ThemeChoice;
  const setTheme = (t: ThemeChoice) => {
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  };
  const { user, role, signOut } = useAuth();

  const [emailNotifications, setEmailNotifications] = useState(true);

  const createdAt = useMemo(() => {
    if (!user?.created_at) return null;
    return new Date(user.created_at).toLocaleString();
  }, [user?.created_at]);

  const lastLoginAt = useMemo(() => {
    // Supabase provides last_sign_in_at on the auth user object.
    const lastSignIn = user?.last_sign_in_at as string | undefined;
    if (!lastSignIn) return null;
    return new Date(lastSignIn).toLocaleString();
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!role) return 'User';
    return role
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [role]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onChangePassword = async (values: PasswordForm) => {
    const { error } = await supabase.auth.updateUser({ password: values.newPassword });
    if (error) {
      toast.error(error.message || 'Failed to update password');
      return;
    }

    toast.success('Password updated');
    reset();
  };

  const onChangeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    toast.success('Language updated');
  };

  const onChangeTheme = async (value: ThemeChoice) => {
    setTheme(value);
    toast.success('Theme updated');
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.functions.invoke('delete-account', {
      body: { confirm: true },
    });

    if (error) {
      toast.error(error.message || 'Failed to delete account');
      return;
    }

    toast.success('Account deleted');
    await signOut();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="space-y-3">
        <SectionAdornment index={1} total={3} label={t('admin.settings.sectionLabel', 'Admin Settings')} align="left" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-display-md">{t('admin.settings.title', 'Admin Settings')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('admin.settings.subtitle', 'Manage your admin account preferences.')}
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/15 text-primary border border-primary/20">
            {roleLabel}
          </Badge>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Read-only account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground break-all">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium text-foreground">{roleLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Account created</p>
                <p className="text-sm font-medium text-foreground">{createdAt || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last login</p>
                <p className="text-sm font-medium text-foreground">{lastLoginAt || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Update your password for this account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" {...register('newPassword')} />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="accent-gradient text-white rounded-full px-6 shadow-signal hover:opacity-90">
                {isSubmitting ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Personalize your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default language</Label>
              <Select value={i18n.language} onValueChange={onChangeLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(v) => onChangeTheme(v as ThemeChoice)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Email notifications</p>
                <p className="text-xs text-muted-foreground">Receive admin updates by email.</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>Irreversible actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-full">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={() => navigate('/admin/master')}
              className="rounded-full border-border"
            >
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default AdminSettings;
