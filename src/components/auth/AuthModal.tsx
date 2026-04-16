import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { SkillFormLogo } from '@/components/SkillFormLogo';

export type AuthModalMode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthModalMode;
  registerToken?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onOpenChange,
  defaultMode = 'login',
  registerToken,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<AuthModalMode>(defaultMode);

  React.useEffect(() => {
    if (open) setMode(defaultMode);
  }, [open, defaultMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-border bg-background rounded-xl">
        <div className="px-6 pt-6 pb-2 text-center">
          <div className="flex justify-center mb-3">
            <SkillFormLogo iconClassName="h-5 w-5" textClassName="text-base" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-headline">
              {mode === 'login'
                ? t('auth.login.title', 'Welcome back')
                : t('auth.register.title', 'Create your account')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {mode === 'login'
                ? t('auth.login.subtitle', 'Sign in to access your team’s talent.')
                : t('auth.register.subtitle', 'Join Skill*form to start exploring talent.')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as AuthModalMode)} className="px-6 pb-6">
          <TabsList className="grid w-full grid-cols-2 mb-5">
            <TabsTrigger value="login">{t('auth.login.signIn', 'Sign in')}</TabsTrigger>
            <TabsTrigger value="register">{t('landing.getStarted', 'Get Started')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0 focus-visible:outline-none">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register" className="mt-0 focus-visible:outline-none">
            {registerToken ? (
              <RegisterForm />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">
                {t('auth.register.inviteOnly', 'Skill*form is invite-only. Ask your administrator for an invitation link to create an account.')}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
