import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SignatureCanvas } from '@/components/SignatureCanvas';
import { useDocumentSignature } from '@/hooks/useDocumentSignature';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { Market, MarketMilestone } from '@/hooks/useMarkets';
import { downloadMarketContractPDF } from '@/lib/utils/marketContractPdfUtils';
import { downloadMarketAmendmentPDF } from '@/lib/utils/marketAmendmentPdfUtils';
import { downloadMarketReceptionPDF } from '@/lib/utils/marketReceptionPdfUtils';
import { FileText, FilePlus, FileCheck, Download } from 'lucide-react';
import { toast } from 'sonner';

interface MarketDocumentsProps {
  market: Market;
  milestones: MarketMilestone[];
}

export function MarketDocuments({ market, milestones }: MarketDocumentsProps) {
  const { companyInfo } = useCompanyInfo();
  const { signDocument } = useDocumentSignature();
  const [documentType, setDocumentType] = useState<'contract' | 'amendment' | 'reception' | null>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string | undefined>();

  // Amendment form state
  const [amendmentData, setAmendmentData] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    changes: '',
    previousAmount: market.actual_amount,
    newAmount: market.actual_amount,
  });

  // Reception report state
  const [receptionData, setReceptionData] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    observations: '',
    reserves: '',
    conformity: 'conforme' as 'conforme' | 'non_conforme' | 'conforme_avec_reserves',
    attendees: [
      { name: '', role: 'Prestataire', entity: companyInfo.name },
      { name: market.clients?.name || '', role: 'Client', entity: market.clients?.name || '' },
    ],
  });

  const handleGenerateContract = async () => {
    setDocumentType('contract');
    setSignatureDialogOpen(true);
  };

  const handleGenerateAmendment = async () => {
    if (!amendmentData.number || !amendmentData.reason || !amendmentData.changes) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setDocumentType('amendment');
    setSignatureDialogOpen(true);
  };

  const handleGenerateReception = async () => {
    if (!receptionData.location || !receptionData.observations) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setDocumentType('reception');
    setSignatureDialogOpen(true);
  };

  const handleSignatureComplete = async (signatureData: string) => {
    setCurrentSignature(signatureData);
    setSignatureDialogOpen(false);

    try {
      // Sign document in database
      const docType = documentType === 'contract' ? 'market_contract' 
        : documentType === 'amendment' ? 'market_amendment' 
        : 'market_reception';
      
      await signDocument(docType, market.id, signatureData, {
        marketReference: market.reference,
        documentType: documentType,
      });

      // Generate PDF
      if (documentType === 'contract') {
        await downloadMarketContractPDF(market, companyInfo, signatureData);
        toast.success('Contrat généré et signé avec succès');
      } else if (documentType === 'amendment') {
        await downloadMarketAmendmentPDF(market, amendmentData, companyInfo, signatureData);
        toast.success('Avenant généré et signé avec succès');
      } else if (documentType === 'reception') {
        await downloadMarketReceptionPDF(market, milestones, receptionData, companyInfo, signatureData);
        toast.success('PV de réception généré et signé avec succès');
      }

      setDocumentType(null);
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Erreur lors de la génération du document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Contrat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contrat
            </CardTitle>
            <CardDescription>Générer le contrat de marché</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateContract} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Générer le contrat
            </Button>
          </CardContent>
        </Card>

        {/* Avenant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePlus className="h-5 w-5" />
              Avenant
            </CardTitle>
            <CardDescription>Générer un avenant au marché</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <Button onClick={() => setDocumentType('amendment')} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Créer un avenant
              </Button>
              {documentType === 'amendment' && (
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Générer un avenant</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amendment-number">Numéro d&apos;avenant *</Label>
                        <Input
                          id="amendment-number"
                          value={amendmentData.number}
                          onChange={(e) => setAmendmentData({ ...amendmentData, number: e.target.value })}
                          placeholder="AV-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amendment-date">Date</Label>
                        <Input
                          id="amendment-date"
                          type="date"
                          value={amendmentData.date}
                          onChange={(e) => setAmendmentData({ ...amendmentData, date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amendment-reason">Motif de l&apos;avenant *</Label>
                      <Textarea
                        id="amendment-reason"
                        value={amendmentData.reason}
                        onChange={(e) => setAmendmentData({ ...amendmentData, reason: e.target.value })}
                        placeholder="Indiquez le motif de l'avenant..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amendment-changes">Modifications apportées *</Label>
                      <Textarea
                        id="amendment-changes"
                        value={amendmentData.changes}
                        onChange={(e) => setAmendmentData({ ...amendmentData, changes: e.target.value })}
                        placeholder="Détaillez les modifications..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="previous-amount">Montant initial</Label>
                        <Input
                          id="previous-amount"
                          type="number"
                          value={amendmentData.previousAmount}
                          onChange={(e) => setAmendmentData({ ...amendmentData, previousAmount: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-amount">Nouveau montant</Label>
                        <Input
                          id="new-amount"
                          type="number"
                          value={amendmentData.newAmount}
                          onChange={(e) => setAmendmentData({ ...amendmentData, newAmount: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleGenerateAmendment} className="w-full">
                      Générer et signer
                    </Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </CardContent>
        </Card>

        {/* PV de réception */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              PV de réception
            </CardTitle>
            <CardDescription>Générer un PV de réception</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <Button onClick={() => setDocumentType('reception')} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Créer un PV
              </Button>
              {documentType === 'reception' && (
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Générer un PV de réception</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reception-date">Date de réception</Label>
                        <Input
                          id="reception-date"
                          type="date"
                          value={receptionData.date}
                          onChange={(e) => setReceptionData({ ...receptionData, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reception-location">Lieu *</Label>
                        <Input
                          id="reception-location"
                          value={receptionData.location}
                          onChange={(e) => setReceptionData({ ...receptionData, location: e.target.value })}
                          placeholder="Lieu de la réception"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conformity">Conformité</Label>
                      <Select
                        value={receptionData.conformity}
                        onValueChange={(value: any) => setReceptionData({ ...receptionData, conformity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conforme">Conforme</SelectItem>
                          <SelectItem value="conforme_avec_reserves">Conforme avec réserves</SelectItem>
                          <SelectItem value="non_conforme">Non conforme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observations">Observations *</Label>
                      <Textarea
                        id="observations"
                        value={receptionData.observations}
                        onChange={(e) => setReceptionData({ ...receptionData, observations: e.target.value })}
                        placeholder="Observations générales..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reserves">Réserves</Label>
                      <Textarea
                        id="reserves"
                        value={receptionData.reserves}
                        onChange={(e) => setReceptionData({ ...receptionData, reserves: e.target.value })}
                        placeholder="Réserves éventuelles..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleGenerateReception} className="w-full">
                      Générer et signer
                    </Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Signature Dialog */}
      {signatureDialogOpen && (
        <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Signer le {documentType === 'contract' ? 'contrat' : documentType === 'amendment' ? 'avenant' : 'PV de réception'}
              </DialogTitle>
            </DialogHeader>
            <SignatureCanvas onComplete={handleSignatureComplete} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
