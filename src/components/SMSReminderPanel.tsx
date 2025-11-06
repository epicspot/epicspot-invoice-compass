import React, { useState } from 'react';
import { MessageSquare, Send, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useReminders } from '@/hooks/useReminders';
import { Checkbox } from '@/components/ui/checkbox';

export function SMSReminderPanel() {
  const { reminders, getPendingReminders } = useReminders();
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Bonjour, ceci est un rappel concernant votre facture. Merci de procéder au règlement.');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const pendingReminders = getPendingReminders();

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un numéro de téléphone',
        variant: 'destructive',
      });
      return;
    }

    if (!message) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un message',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-reminder', {
        body: {
          reminderIds: selectedReminders,
          phoneNumber,
          message,
        },
      });

      if (error) throw error;

      toast({
        title: 'SMS envoyé',
        description: `Le rappel a été envoyé au ${phoneNumber}`,
      });

      // Reset
      setSelectedReminders([]);
      setPhoneNumber('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'envoi du SMS',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const toggleReminder = (id: string) => {
    setSelectedReminders(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Rappels SMS Automatiques
        </CardTitle>
        <CardDescription>
          Envoyez des rappels par SMS aux clients pour les factures en attente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Rappels en attente ({pendingReminders.length})</Label>
          <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
            {pendingReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun rappel en attente</p>
            ) : (
              pendingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedReminders.includes(reminder.id)}
                    onCheckedChange={() => toggleReminder(reminder.id)}
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{reminder.clientName}</p>
                    <p className="text-muted-foreground">
                      Document: {reminder.documentNumber} - Montant: {reminder.amount.toFixed(2)} DZD
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <div className="flex gap-2">
            <Phone className="h-5 w-5 text-muted-foreground mt-2" />
            <Input
              id="phone"
              type="tel"
              placeholder="+213 XXX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            rows={4}
            placeholder="Votre message de rappel..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {message.length} / 160 caractères
          </p>
        </div>

        <Button
          onClick={handleSendSMS}
          disabled={sending || !phoneNumber || selectedReminders.length === 0}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'Envoi en cours...' : `Envoyer SMS (${selectedReminders.length} rappel(s))`}
        </Button>

        <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
          <p className="font-medium">Configuration Twilio requise</p>
          <p className="text-muted-foreground">
            Les clés Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) sont configurées et prêtes à l'emploi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
