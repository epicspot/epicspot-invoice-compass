import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { Mail, Plus, Edit, Trash2, Eye, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmailTemplatesManagement = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate, renderTemplate } = useEmailTemplates();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'invoice_reminder' as 'invoice_reminder' | 'quote_reminder' | 'payment_confirmation',
    subject: '',
    body_html: '',
    is_default: false,
  });

  const typeLabels = {
    invoice_reminder: 'Rappel de facture',
    quote_reminder: 'Rappel de devis',
    payment_confirmation: 'Confirmation de paiement',
  };

  const availableVariables = [
    { key: 'client_name', label: 'Nom du client' },
    { key: 'invoice_number', label: 'Numéro de facture' },
    { key: 'amount', label: 'Montant' },
    { key: 'due_date', label: "Date d'échéance" },
    { key: 'email_title', label: "Titre de l'email" },
    { key: 'email_message', label: 'Message principal' },
    { key: 'signature', label: 'Signature' },
    { key: 'footer_text', label: 'Texte du pied de page' },
  ];

  const handleCreate = async () => {
    try {
      await createTemplate({
        ...formData,
        variables: availableVariables.map(v => v.key),
      });
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await updateTemplate(selectedTemplate.id, formData);
      setIsEditOpen(false);
      setSelectedTemplate(null);
      resetForm();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      await deleteTemplate(id);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body_html: template.body_html,
      is_default: template.is_default,
    });
    setIsEditOpen(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    const { body } = renderTemplate(template, {
      client_name: 'Jean Dupont',
      invoice_number: 'INV-2024-001',
      amount: '50,000',
      due_date: '15/01/2025',
      email_title: 'Rappel de paiement',
      email_message: 'Nous vous informons qu\'une facture reste impayée et nécessite votre attention.',
      signature: 'Cordialement,<br><strong>L\'équipe de gestion</strong>',
      footer_text: 'Ceci est un message automatique, merci de ne pas y répondre directement.',
    });
    setPreviewHtml(body);
    setIsPreviewOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'invoice_reminder',
      subject: '',
      body_html: '',
      is_default: false,
    });
  };

  const insertVariable = (variable: string, field: 'subject' | 'body_html') => {
    const insertText = `{{${variable}}}`;
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] + insertText,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Templates d'Emails
          </h2>
          <p className="text-muted-foreground mt-1">
            Personnalisez les templates d'emails pour les rappels et notifications
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un template d'email</DialogTitle>
              <DialogDescription>
                Créez un nouveau template personnalisé pour vos emails
              </DialogDescription>
            </DialogHeader>
            <TemplateForm
              formData={formData}
              setFormData={setFormData}
              availableVariables={availableVariables}
              insertVariable={insertVariable}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {template.is_default && (
                        <Badge variant="secondary">Par défaut</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {typeLabels[template.type]}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Sujet:</span> {template.subject}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="font-medium">Variables:</span>
                    {template.variables?.map((v) => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le template</DialogTitle>
            <DialogDescription>
              Modifiez le template d'email
            </DialogDescription>
          </DialogHeader>
          <TemplateForm
            formData={formData}
            setFormData={setFormData}
            availableVariables={availableVariables}
            insertVariable={insertVariable}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du template</DialogTitle>
            <DialogDescription>
              Aperçu avec des données d'exemple
            </DialogDescription>
          </DialogHeader>
          <div
            className="border rounded-lg p-4 bg-background"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TemplateFormProps {
  formData: {
    name: string;
    type: 'invoice_reminder' | 'quote_reminder' | 'payment_confirmation';
    subject: string;
    body_html: string;
    is_default: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  availableVariables: Array<{ key: string; label: string }>;
  insertVariable: (variable: string, field: 'subject' | 'body_html') => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  formData,
  setFormData,
  availableVariables,
  insertVariable,
}) => {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="content">Contenu</TabsTrigger>
        <TabsTrigger value="variables">Variables</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du template</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Rappel de paiement mensuel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invoice_reminder">Rappel de facture</SelectItem>
              <SelectItem value="quote_reminder">Rappel de devis</SelectItem>
              <SelectItem value="payment_confirmation">Confirmation de paiement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_default"
            checked={formData.is_default}
            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
          />
          <Label htmlFor="is_default">Template par défaut</Label>
        </div>
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="subject">Sujet de l'email</Label>
            <div className="flex gap-1">
              {availableVariables.slice(0, 3).map((v) => (
                <Button
                  key={v.key}
                  size="sm"
                  variant="outline"
                  onClick={() => insertVariable(v.key, 'subject')}
                  className="text-xs"
                >
                  <Code className="h-3 w-3 mr-1" />
                  {v.key}
                </Button>
              ))}
            </div>
          </div>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Rappel de paiement - Facture {{invoice_number}}"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body_html">Contenu HTML</Label>
          <Textarea
            id="body_html"
            value={formData.body_html}
            onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
            placeholder="<html>...</html>"
            className="font-mono text-sm"
            rows={20}
          />
        </div>
      </TabsContent>

      <TabsContent value="variables" className="space-y-4">
        <div>
          <h3 className="font-medium mb-3">Variables disponibles</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cliquez sur une variable pour l'ajouter au contenu HTML
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableVariables.map((v) => (
              <Button
                key={v.key}
                variant="outline"
                onClick={() => insertVariable(v.key, 'body_html')}
                className="justify-start"
              >
                <Code className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-mono text-xs">{`{{${v.key}}}`}</div>
                  <div className="text-xs text-muted-foreground">{v.label}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default EmailTemplatesManagement;
