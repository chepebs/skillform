import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, X, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SendMessageModalProps {
  recipientId: string;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  recipientId,
  recipientName,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast.error(t('messages.fillAllFields', 'Please fill in all fields'));
      return;
    }

    if (!user?.id) {
      toast.error(t('messages.notAuthenticated', 'You must be logged in to send messages'));
      return;
    }

    setSending(true);

    try {
      // Insert message into database
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          from_user_id: user.id,
          to_user_id: recipientId,
          subject: subject.trim(),
          message: message.trim(),
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Create notification for recipient
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message',
          title: t('messages.newMessage', 'New Message'),
          message: `${subject}`,
          link: `/messages/${messageData.id}`,
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast.success(t('messages.sent', 'Message sent successfully'));
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('messages.sendFailed', 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t('messages.sendTo', 'Send message to {{name}}', { name: recipientName })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">{t('messages.subject', 'Subject')}</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('messages.subjectPlaceholder', 'Enter subject...')}
              maxLength={255}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t('messages.message', 'Message')}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('messages.messagePlaceholder', 'Type your message here...')}
              rows={6}
              className="bg-background border-border resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={sending}>
              {t('common.buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={sending || !subject.trim() || !message.trim()}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('messages.sending', 'Sending...')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('messages.send', 'Send')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
