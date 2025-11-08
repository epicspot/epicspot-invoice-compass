import { TemplateVersion } from '@/hooks/useTemplateVersions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplateVersionDiffProps {
  version1: TemplateVersion;
  version2: TemplateVersion;
}

export function TemplateVersionDiff({ version1, version2 }: TemplateVersionDiffProps) {
  const getDiffValue = (key: string, v1: any, v2: any) => {
    const val1 = JSON.stringify(v1, null, 2);
    const val2 = JSON.stringify(v2, null, 2);
    
    if (val1 === val2) return null;
    
    return { old: val1, new: val2 };
  };

  const nameDiff = version1.name !== version2.name ? {
    old: version1.name,
    new: version2.name
  } : null;

  const sectionsDiff = getDiffValue('sections', version1.sections, version2.sections);
  const layoutDiff = getDiffValue('layout', version1.layout, version2.layout);
  const stylesDiff = getDiffValue('styles', version1.styles, version2.styles);
  const logoDiff = version1.logo_url !== version2.logo_url ? {
    old: version1.logo_url || 'Aucun',
    new: version2.logo_url || 'Aucun'
  } : null;

  const hasDiff = nameDiff || sectionsDiff || layoutDiff || stylesDiff || logoDiff;

  if (!hasDiff) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune différence détectée
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {nameDiff && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Nom du template
                <Badge variant="outline">Modifié</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Version {version1.version_number}</p>
                  <div className="bg-destructive/10 p-3 rounded text-sm">
                    {nameDiff.old}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Version {version2.version_number}</p>
                  <div className="bg-primary/10 p-3 rounded text-sm">
                    {nameDiff.new}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {sectionsDiff && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Sections
                <Badge variant="outline">Modifiées</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Version {version1.version_number}</p>
                  <div className="bg-destructive/10 p-3 rounded text-xs font-mono overflow-auto max-h-[300px]">
                    <pre>{sectionsDiff.old}</pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Version {version2.version_number}</p>
                  <div className="bg-primary/10 p-3 rounded text-xs font-mono overflow-auto max-h-[300px]">
                    <pre>{sectionsDiff.new}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {layoutDiff && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Mise en page
                <Badge variant="outline">Modifiée</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Version {version1.version_number}</p>
                  <div className="bg-destructive/10 p-3 rounded text-xs font-mono overflow-auto max-h-[200px]">
                    <pre>{layoutDiff.old}</pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Version {version2.version_number}</p>
                  <div className="bg-primary/10 p-3 rounded text-xs font-mono overflow-auto max-h-[200px]">
                    <pre>{layoutDiff.new}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stylesDiff && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Styles
                <Badge variant="outline">Modifiés</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Version {version1.version_number}</p>
                  <div className="bg-destructive/10 p-3 rounded text-xs font-mono overflow-auto max-h-[200px]">
                    <pre>{stylesDiff.old}</pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Version {version2.version_number}</p>
                  <div className="bg-primary/10 p-3 rounded text-xs font-mono overflow-auto max-h-[200px]">
                    <pre>{stylesDiff.new}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {logoDiff && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Logo
                <Badge variant="outline">Modifié</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Version {version1.version_number}</p>
                  <div className="bg-destructive/10 p-3 rounded text-sm break-all">
                    {logoDiff.old}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Version {version2.version_number}</p>
                  <div className="bg-primary/10 p-3 rounded text-sm break-all">
                    {logoDiff.new}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
