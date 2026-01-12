import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useAppNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const { navigateToDashboard } = useAppNavigation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast.error(error.message || t('auth.login.invalidCredentials'));
        return;
      }
      
      toast.success(t('common.messages.success'));
      navigateToDashboard();
    } catch (err) {
      toast.error(t('common.messages.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitWithDebug = (data: LoginFormData) => {
    console.log('🔍 Login attempt with:', { email: data.email, passwordLength: data.password?.length });
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitWithDebug)} className="space-y-6" autoComplete="off">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-white/80">{t('auth.login.emailLabel')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            id="login-email"
            type="email"
            placeholder={t('auth.login.emailPlaceholder')}
            className="pl-10 bg-black border-white/10 text-white placeholder:text-white/30 focus:border-red-500 focus:ring-red-500/20 transition-all"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-white/80">{t('auth.login.passwordLabel')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.login.passwordPlaceholder')}
            className="pl-10 pr-10 bg-black border-white/10 text-white placeholder:text-white/30 focus:border-red-500 focus:ring-red-500/20 transition-all"
            autoComplete="new-password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="rememberMe" className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600" {...register('rememberMe')} />
          <Label htmlFor="rememberMe" className="text-sm text-white/60 cursor-pointer">
            {t('auth.login.rememberMe')}
          </Label>
        </div>
        <a href="#" className="text-sm text-red-500 hover:text-red-400 transition-colors">
          {t('auth.login.forgotPassword')}
        </a>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_8px_25px_rgba(255,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(255,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
        disabled={isSubmitting}
      >
        {/* Shine effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('common.messages.loading')}
          </>
        ) : (
          t('auth.login.submitButton')
        )}
      </Button>

      <p className="text-center text-sm text-white/50">
        {t('auth.login.noAccount').replace("Don't have an account?", "").trim() || 'Need help?'}{' '}
        <a href="#" className="text-red-500 hover:text-red-400 transition-colors">
          {t('auth.login.contactSupport')}
        </a>
      </p>
    </form>
  );
};
