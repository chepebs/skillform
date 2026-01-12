import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SendMessageModal } from './SendMessageModal';
import { useAuth } from '@/contexts/AuthContext';

interface MessageButtonProps {
  recipientId: string;
  recipientName: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export const MessageButton: React.FC<MessageButtonProps> = ({
  recipientId,
  recipientName,
  variant = 'outline',
  size = 'sm',
  className = '',
  showText = true,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show button for own profile
  if (user?.id === recipientId) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <MessageSquare className="h-4 w-4" />
        {showText && <span className="ml-2">{t('messages.sendMessage', 'Message')}</span>}
      </Button>

      <SendMessageModal
        recipientId={recipientId}
        recipientName={recipientName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
