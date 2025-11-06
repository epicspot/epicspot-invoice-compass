import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, Filter } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

const reportTypes = [
  { value: 'financial', label: 'Rapport financier', fields: ['revenue', 'expenses', 'profit'] },
  { value: 'sales', label: 'Rapport des ventes', fields: ['invoices', 'quotes', 'clients'] },
  { value: 'inventory', label: 'Rapport d\'inventaire', fields: ['stock', 'movements', 'alerts'] },
  { value: 'collections', label: 'Rapport de recouvrement', fields: ['collections', 'vendors', 'performance'] },
];

const exportFormats = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
];

export function ReportBuilder() {
  const [reportType, setReportType] = useState('financial');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const currentType = reportTypes.find(t => t.value === reportType);

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleGenerateReport = () => {
    console.log('Generating report:', {
      type: reportType,
      format: exportFormat,
      dateRange,
      fields: selectedFields
    });
    // Implement report generation logic
    alert('Rapport en cours de génération...');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Créateur de rapports personnalisés
        </CardTitle>
        <CardDescription>
          Configurez et générez des rapports sur mesure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type de rapport */}
        <div className="space-y-2">
          <Label>Type de rapport</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Période */}
        <div className="space-y-2">
          <Label>Période</Label>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>

        {/* Champs à inclure */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Champs à inclure
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentType?.fields.map(field => (
              <div key={field} className="flex items-center gap-2 p-3 rounded-lg border">
                <Checkbox
                  id={field}
                  checked={selectedFields.includes(field)}
                  onCheckedChange={() => handleFieldToggle(field)}
                />
                <Label htmlFor={field} className="capitalize cursor-pointer">
                  {field.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Format d'export */}
        <div className="space-y-2">
          <Label>Format d'export</Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {exportFormats.map(format => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aperçu de la configuration */}
        <div className="p-4 rounded-lg bg-muted">
          <h4 className="font-semibold mb-2">Configuration du rapport</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>• Type: {currentType?.label}</p>
            <p>• Période: {dateRange?.from?.toLocaleDateString()} - {dateRange?.to?.toLocaleDateString()}</p>
            <p>• Champs: {selectedFields.length} sélectionnés</p>
            <p>• Format: {exportFormats.find(f => f.value === exportFormat)?.label}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport} className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Générer le rapport
          </Button>
          <Button variant="outline">
            Sauvegarder le modèle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
