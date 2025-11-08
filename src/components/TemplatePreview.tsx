import { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatFCFA } from '@/lib/utils';

interface TemplatePreviewProps {
  template: DocumentTemplate;
  autoRefresh?: boolean;
}

const sampleData = {
  contract: {
    market: {
      reference: 'MKT-2024-001',
      title: 'Construction d\'un bâtiment administratif',
      type: 'public',
      start_date: '2024-01-15',
      end_date: '2024-12-31',
      estimated_amount: 50000000,
      actual_amount: 48000000,
      deposit_percentage: 30,
      deposit_amount: 14400000,
      payment_terms: 'Paiement en 4 tranches selon avancement des travaux',
      delivery_terms: 'Livraison clé en main avec garantie décennale',
      description: 'Construction d\'un immeuble de bureaux R+3 avec parking souterrain, incluant l\'aménagement des espaces verts et des voiries d\'accès.',
      clients: {
        name: 'Ministère des Infrastructures',
        code: 'MIN-INFRA-001'
      }
    },
    companyInfo: {
      name: 'EPICSPOT CONSULTING',
      address: 'Abidjan, Côte d\'Ivoire',
      phone: '+225 XX XX XX XX',
      email: 'contact@epicspot.com',
      taxId: 'RC: XXXXXXX - IF: XXXXXXX'
    }
  },
  amendment: {
    number: 'AV-001',
    date: '2024-06-15',
    reason: 'Modification du délai d\'exécution suite aux intempéries',
    changes: 'Prolongation du délai d\'exécution de 3 mois supplémentaires. Ajout d\'une clause de révision des prix en raison de l\'augmentation des coûts des matériaux.',
    previousAmount: 48000000,
    newAmount: 52000000
  },
  reception: {
    date: '2024-12-20',
    location: 'Abidjan, Plateau',
    observations: 'Les travaux ont été réalisés conformément aux spécifications techniques. La qualité des finitions est satisfaisante.',
    reserves: 'Quelques retouches de peinture nécessaires dans les bureaux du 2ème étage',
    conformity: 'conforme_avec_reserves' as const,
    attendees: [
      { name: 'Jean KOUASSI', role: 'Prestataire', entity: 'EPICSPOT CONSULTING' },
      { name: 'Marie TOURE', role: 'Client', entity: 'Ministère des Infrastructures' },
      { name: 'Ahmed DIALLO', role: 'Expert technique', entity: 'Bureau de contrôle VERITAS' }
    ]
  }
};

export function TemplatePreview({ template, autoRefresh = false }: TemplatePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generatePreviewPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: template.layout.orientation,
        format: template.layout.pageSize.toLowerCase() as any
      });

      const margins = template.layout.margins;
      const styles = template.styles;
      let yPos = margins.top;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margins.left - margins.right;

      // Helper functions
      const setFont = (size: number, bold: boolean = false) => {
        doc.setFontSize(size);
        doc.setFont(styles.fontFamily, bold ? 'bold' : 'normal');
      };

      const addText = (text: string, y: number, options: any = {}) => {
        const color = options.color || styles.primaryColor;
        const rgb = hexToRgb(color);
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text(text, options.x || margins.left, y, options);
        return y;
      };

      const addSection = (title: string, content: string, y: number) => {
        setFont(styles.headingFontSize, true);
        y = addText(title, y, { color: styles.primaryColor }) + 8;
        
        setFont(styles.bodyFontSize);
        const lines = doc.splitTextToSize(content, contentWidth);
        doc.text(lines, margins.left, y);
        return y + (lines.length * 5) + 8;
      };

      // Convert hex to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };

      // Render sections based on template type and enabled sections
      const enabledSections = template.sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order);

      for (const section of enabledSections) {
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = margins.top;
        }

        switch (section.id) {
          case 'header':
            // Logo
            if (template.logo_url) {
              try {
                doc.addImage(template.logo_url, 'PNG', margins.left, yPos, 30, 15);
                yPos += 20;
              } catch (e) {
                console.log('Logo not loaded');
              }
            }
            
            setFont(styles.titleFontSize - 2, true);
            yPos = addText(
              sampleData.contract.companyInfo.name,
              yPos,
              { x: pageWidth / 2, align: 'center' }
            ) + 6;
            
            setFont(styles.bodyFontSize);
            yPos = addText(
              sampleData.contract.companyInfo.address,
              yPos,
              { x: pageWidth / 2, align: 'center', color: styles.secondaryColor }
            ) + 4;
            yPos = addText(
              `Tél: ${sampleData.contract.companyInfo.phone}`,
              yPos,
              { x: pageWidth / 2, align: 'center', color: styles.secondaryColor }
            ) + 12;
            break;

          case 'market_info':
            if (template.type === 'contract') {
              setFont(styles.titleFontSize, true);
              yPos = addText(
                'CONTRAT DE MARCHÉ',
                yPos,
                { x: pageWidth / 2, align: 'center' }
              ) + 12;

              yPos = addSection(
                'INFORMATIONS DU MARCHÉ',
                `Référence: ${sampleData.contract.market.reference}\nTitre: ${sampleData.contract.market.title}\nType: Public`,
                yPos
              );
            }
            break;

          case 'client_info':
            if (template.type === 'contract') {
              yPos = addSection(
                'CLIENT',
                `Nom: ${sampleData.contract.market.clients.name}\nCode: ${sampleData.contract.market.clients.code}`,
                yPos
              );
            }
            break;

          case 'amounts':
            if (template.type === 'contract') {
              yPos = addSection(
                'MONTANTS',
                `Montant estimé: ${formatFCFA(sampleData.contract.market.estimated_amount)}\nMontant réel: ${formatFCFA(sampleData.contract.market.actual_amount)}\nAcompte: ${sampleData.contract.market.deposit_percentage}% (${formatFCFA(sampleData.contract.market.deposit_amount || 0)})`,
                yPos
              );
            } else if (template.type === 'amendment') {
              yPos = addSection(
                'MODIFICATION DES MONTANTS',
                `Montant initial: ${formatFCFA(sampleData.amendment.previousAmount)}\nNouveau montant: ${formatFCFA(sampleData.amendment.newAmount)}\nDifférence: +${formatFCFA(sampleData.amendment.newAmount - sampleData.amendment.previousAmount)}`,
                yPos
              );
            }
            break;

          case 'terms':
            if (template.type === 'contract') {
              yPos = addSection(
                'CONDITIONS DE PAIEMENT',
                sampleData.contract.market.payment_terms || 'Non définies',
                yPos
              );
              yPos = addSection(
                'CONDITIONS DE LIVRAISON',
                sampleData.contract.market.delivery_terms || 'Non définies',
                yPos
              );
            }
            break;

          case 'description':
            if (template.type === 'contract') {
              yPos = addSection(
                'DESCRIPTION',
                sampleData.contract.market.description || 'Non définie',
                yPos
              );
            }
            break;

          case 'amendment_info':
            if (template.type === 'amendment') {
              setFont(styles.titleFontSize, true);
              yPos = addText(
                'AVENANT AU MARCHÉ',
                yPos,
                { x: pageWidth / 2, align: 'center' }
              ) + 12;

              yPos = addSection(
                'INFORMATIONS DE L\'AVENANT',
                `Numéro: ${sampleData.amendment.number}\nDate: ${sampleData.amendment.date}\nMarché: MKT-2024-001`,
                yPos
              );
            }
            break;

          case 'reason':
            if (template.type === 'amendment') {
              yPos = addSection('MOTIF', sampleData.amendment.reason, yPos);
            }
            break;

          case 'changes':
            if (template.type === 'amendment') {
              yPos = addSection('MODIFICATIONS', sampleData.amendment.changes, yPos);
            }
            break;

          case 'conformity':
            if (template.type === 'reception') {
              yPos = addSection(
                'CONFORMITÉ',
                'Les travaux sont conformes sous réserves',
                yPos
              );
            }
            break;

          case 'observations':
            if (template.type === 'reception') {
              yPos = addSection('OBSERVATIONS', sampleData.reception.observations, yPos);
            }
            break;

          case 'reserves':
            if (template.type === 'reception' && sampleData.reception.reserves) {
              yPos = addSection('RÉSERVES', sampleData.reception.reserves, yPos);
            }
            break;

          case 'signatures':
            if (yPos > doc.internal.pageSize.getHeight() - 60) {
              doc.addPage();
              yPos = margins.top;
            }

            setFont(styles.headingFontSize, true);
            yPos = addText('SIGNATURES', yPos) + 12;

            setFont(styles.bodyFontSize);
            addText('Le Prestataire', yPos, { x: margins.left });
            addText('Le Client', yPos, { x: pageWidth - margins.right - 50 });
            yPos += 30;
            addText(`Date: ${new Date().toLocaleDateString('fr-FR')}`, yPos, { x: margins.left });
            break;
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      setFont(8);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const rgb = hexToRgb(styles.secondaryColor);
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text(
          `Page ${i} sur ${pageCount} - ${sampleData.contract.companyInfo.taxId}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Generate blob URL
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      
      // Revoke old URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Erreur lors de la génération de l\'aperçu');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      generatePreviewPDF();
    }
  }, [template, autoRefresh]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleDownloadPreview = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Preview_${template.name}_${Date.now()}.pdf`;
      link.click();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Aperçu du template</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePreviewPDF}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          {pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPreview}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 bg-muted/30">
        {pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border rounded-lg bg-white"
            title="PDF Preview"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <p>Aucun aperçu disponible</p>
              <Button onClick={generatePreviewPDF} disabled={isGenerating}>
                {isGenerating ? 'Génération...' : 'Générer l\'aperçu'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
