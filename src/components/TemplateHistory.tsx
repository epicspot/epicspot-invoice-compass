import { useState, useRef } from 'react';
import { useTemplateVersions, TemplateVersion, ComparisonResult } from '@/hooks/useTemplateVersions';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Save, GitCompare, Clock, Tag, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { TemplateVersionDiff } from './TemplateVersionDiff';

interface TemplateHistoryProps {
  template: DocumentTemplate;
  onRestore?: () => void;
}

export function TemplateHistory({ template, onRestore }: TemplateHistoryProps) {
  const { versions, loading, createManualVersion, restoreVersion, compareVersions, addTagToVersion, removeTagFromVersion } = useTemplateVersions(template.id);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [selectedVersion1, setSelectedVersion1] = useState<TemplateVersion | null>(null);
  const [selectedVersion2, setSelectedVersion2] = useState<TemplateVersion | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedVersionForTag, setSelectedVersionForTag] = useState<TemplateVersion | null>(null);
  const [newTag, setNewTag] = useState('');

  const handleSaveVersion = async () => {
    if (!changeSummary.trim()) {
      toast.error('Veuillez décrire les modifications');
      return;
    }

    await createManualVersion(
      template.id,
      {
        name: template.name,
        sections: template.sections,
        layout: template.layout,
        styles: template.styles,
        logo_url: template.logo_url
      },
      changeSummary
    );

    setShowSaveDialog(false);
    setChangeSummary('');
  };

  const handleRestore = async (version: TemplateVersion) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cette version ? Les modifications non sauvegardées seront perdues.')) {
      return;
    }

    const result = await restoreVersion(version, template.id);
    if (result.success && onRestore) {
      onRestore();
    }
  };

  const handleCompare = () => {
    if (!selectedVersion1 || !selectedVersion2) {
      toast.error('Veuillez sélectionner deux versions à comparer');
      return;
    }
    const result = compareVersions(selectedVersion1.id, selectedVersion2.id);
    setComparisonData(result);
    setShowCompareDialog(true);
  };

  const handleAddTag = async () => {
    if (!selectedVersionForTag || !newTag.trim()) {
      toast.error('Veuillez entrer un tag');
      return;
    }

    await addTagToVersion(selectedVersionForTag.id, newTag.trim());
    setNewTag('');
    setShowTagDialog(false);
  };

  const handleRemoveTag = async (versionId: string, tag: string) => {
    await removeTagFromVersion(versionId, tag);
  };

  const openTagDialog = (version: TemplateVersion) => {
    setSelectedVersionForTag(version);
    setShowTagDialog(true);
  };

  const getVersionBadge = (version: TemplateVersion) => {
    const isAutomatic = version.change_summary?.includes('automatique');
    return (
      <Badge variant={isAutomatic ? 'secondary' : 'default'}>
        v{version.version_number}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Chargement de l'historique...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <div>
                <CardTitle>Historique des versions</CardTitle>
                <CardDescription>{versions.length} version(s) enregistrée(s)</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompare}
                disabled={(selectedVersion1 && selectedVersion2) === null}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Comparer
              </Button>
              <Button size="sm" onClick={() => setShowSaveDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder version
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune version enregistrée</p>
              <p className="text-sm mt-2">Les versions sont créées automatiquement lors des modifications</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead className="w-12"></TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Modifications</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <div className="flex gap-1">
                          <input
                            type="radio"
                            name="version1"
                            checked={selectedVersion1?.id === version.id}
                            onChange={() => setSelectedVersion1(version)}
                            className="cursor-pointer"
                          />
                          <input
                            type="radio"
                            name="version2"
                            checked={selectedVersion2?.id === version.id}
                            onChange={() => setSelectedVersion2(version)}
                            className="cursor-pointer"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{getVersionBadge(version)}</TableCell>
                      <TableCell className="font-medium">{version.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {version.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(version.id, tag)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTagDialog(version)}
                            className="h-5 px-2"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {version.change_summary || 'Aucune description'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(version.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(version)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restaurer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Save Version Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder une version</DialogTitle>
            <DialogDescription>
              Créez un point de sauvegarde manuel de votre template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="change-summary">Description des modifications *</Label>
              <Textarea
                id="change-summary"
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="Décrivez les modifications apportées..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveVersion}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Versions Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Comparer les versions</DialogTitle>
            <DialogDescription>
              Différences entre la version {selectedVersion1?.version_number} et la version {selectedVersion2?.version_number}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedVersion1 && selectedVersion2 && (
              <TemplateVersionDiff version1={selectedVersion1} version2={selectedVersion2} />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCompareDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un tag</DialogTitle>
            <DialogDescription>
              Marquez cette version avec un tag (stable, test, production, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-tag">Tag</Label>
              <Input
                id="new-tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ex: stable, production..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['stable', 'test', 'production', 'dev'].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setNewTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTag}>
              <Tag className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}