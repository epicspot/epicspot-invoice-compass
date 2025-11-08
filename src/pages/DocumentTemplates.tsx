import { useState } from 'react';
import { useDocumentTemplates, DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { TemplateEditor } from '@/components/TemplateEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, FileText, FilePlus, FileCheck, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DocumentTemplates() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useDocumentTemplates();
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contract' | 'amendment' | 'reception'>('contract');

  const getDefaultTemplate = (type: string): DocumentTemplate => ({
    id: '',
    name: `Nouveau template ${type === 'contract' ? 'contrat' : type === 'amendment' ? 'avenant' : 'PV'}`,
    type: type as any,
    sections: type === 'contract' ? [
      { id: 'header', name: 'En-tête', enabled: true, order: 1 },
      { id: 'market_info', name: 'Informations du marché', enabled: true, order: 2 },
      { id: 'client_info', name: 'Informations client', enabled: true, order: 3 },
      { id: 'amounts', name: 'Montants', enabled: true, order: 4 },
      { id: 'terms', name: 'Conditions', enabled: true, order: 5 },
      { id: 'description', name: 'Description', enabled: true, order: 6 },
      { id: 'signatures', name: 'Signatures', enabled: true, order: 7 },
    ] : type === 'amendment' ? [
      { id: 'header', name: 'En-tête', enabled: true, order: 1 },
      { id: 'amendment_info', name: 'Informations avenant', enabled: true, order: 2 },
      { id: 'reason', name: 'Motif', enabled: true, order: 3 },
      { id: 'changes', name: 'Modifications', enabled: true, order: 4 },
      { id: 'amounts', name: 'Montants', enabled: true, order: 5 },
      { id: 'signatures', name: 'Signatures', enabled: true, order: 6 },
    ] : [
      { id: 'header', name: 'En-tête', enabled: true, order: 1 },
      { id: 'market_info', name: 'Marché concerné', enabled: true, order: 2 },
      { id: 'attendees', name: 'Personnes présentes', enabled: true, order: 3 },
      { id: 'milestones', name: 'Récapitulatif jalons', enabled: true, order: 4 },
      { id: 'conformity', name: 'Conformité', enabled: true, order: 5 },
      { id: 'observations', name: 'Observations', enabled: true, order: 6 },
      { id: 'reserves', name: 'Réserves', enabled: true, order: 7 },
      { id: 'signatures', name: 'Signatures', enabled: true, order: 8 },
    ],
    layout: {
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      orientation: 'portrait',
    },
    styles: {
      primaryColor: '#000000',
      secondaryColor: '#666666',
      titleFontSize: 18,
      headingFontSize: 12,
      bodyFontSize: 10,
      fontFamily: 'helvetica',
    },
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const handleCreate = (type: string) => {
    setEditingTemplate(getDefaultTemplate(type));
    setIsDialogOpen(true);
  };

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    if (editingTemplate.id) {
      await updateTemplate(editingTemplate.id, editingTemplate);
    } else {
      await createTemplate(editingTemplate);
    }

    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      await deleteTemplate(id);
    }
  };

  const handleDuplicate = async (template: DocumentTemplate) => {
    const newTemplate = {
      ...template,
      name: `${template.name} (copie)`,
      is_default: false,
    };
    delete (newTemplate as any).id;
    delete (newTemplate as any).created_at;
    delete (newTemplate as any).updated_at;
    delete (newTemplate as any).created_by;
    
    await createTemplate(newTemplate);
  };

  const getTemplatesByType = (type: string) => {
    return templates.filter(t => t.type === type);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'amendment': return <FilePlus className="h-4 w-4" />;
      case 'reception': return <FileCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderTemplateTable = (type: string) => {
    const typeTemplates = getTemplatesByType(type);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(type)}
                Templates {type === 'contract' ? 'Contrat' : type === 'amendment' ? 'Avenant' : 'PV Réception'}
              </CardTitle>
              <CardDescription>{typeTemplates.length} template(s)</CardDescription>
            </div>
            <Button onClick={() => handleCreate(type)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {typeTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun template pour le moment
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Défaut</TableHead>
                  <TableHead>Modifié le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typeTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {template.sections.filter(s => s.enabled).length}/{template.sections.length}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.layout.pageSize}</TableCell>
                    <TableCell>
                      {template.is_default && <Badge>Par défaut</Badge>}
                    </TableCell>
                    <TableCell>
                      {format(new Date(template.updated_at), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Templates de documents</h1>
        <p className="text-muted-foreground">
          Personnalisez vos templates de documents contractuels
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="contract">Contrats</TabsTrigger>
          <TabsTrigger value="amendment">Avenants</TabsTrigger>
          <TabsTrigger value="reception">PV Réception</TabsTrigger>
        </TabsList>

        <TabsContent value="contract">{renderTemplateTable('contract')}</TabsContent>
        <TabsContent value="amendment">{renderTemplateTable('amendment')}</TabsContent>
        <TabsContent value="reception">{renderTemplateTable('reception')}</TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? 'Modifier le template' : 'Nouveau template'}
            </DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <TemplateEditor
              template={editingTemplate}
              onChange={(updates) => setEditingTemplate({ ...editingTemplate, ...updates })}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingTemplate(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
