import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { exportToPDF, exportToExcel, exportToWord } from '@/lib/utils/exportUtils';

interface ExportData {
  title: string;
  subtitle?: string;
  period?: string;
  summary?: Array<{ label: string; value: string | number }>;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
}

interface ExportButtonsProps {
  data: ExportData;
  baseFilename?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  data, 
  baseFilename = 'rapport' 
}) => {
  const handleExport = async (format: 'pdf' | 'excel' | 'word') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${baseFilename}_${timestamp}`;

    switch (format) {
      case 'pdf':
        exportToPDF(data, `${filename}.pdf`);
        break;
      case 'excel':
        exportToExcel(data, `${filename}.xlsx`);
        break;
      case 'word':
        await exportToWord(data, `${filename}.docx`);
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('word')}>
          <FileType className="h-4 w-4 mr-2" />
          Export Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButtons;
