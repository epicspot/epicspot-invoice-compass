import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel } from 'docx';

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

// Export en PDF
export const exportToPDF = (data: ExportData, filename: string = 'rapport.pdf') => {
  const doc = new jsPDF();
  let yPosition = 20;

  // En-tête
  doc.setFontSize(18);
  doc.text(data.title, 14, yPosition);
  yPosition += 10;

  if (data.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(data.subtitle, 14, yPosition);
    yPosition += 8;
  }

  if (data.period) {
    doc.setFontSize(10);
    doc.text(data.period, 14, yPosition);
    yPosition += 10;
  }

  doc.setTextColor(0);

  // Résumé
  if (data.summary && data.summary.length > 0) {
    doc.setFontSize(14);
    doc.text('Résumé', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    data.summary.forEach(item => {
      doc.text(`${item.label}: ${item.value}`, 14, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  // Tables
  if (data.tables && data.tables.length > 0) {
    data.tables.forEach((table, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text(table.title, 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [table.headers],
        body: table.rows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 66, 66] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    });
  }

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(filename);
};

// Export en Excel
export const exportToExcel = (data: ExportData, filename: string = 'rapport.xlsx') => {
  const workbook = XLSX.utils.book_new();

  // Créer une feuille pour le résumé
  if (data.summary && data.summary.length > 0) {
    const summaryData = [
      [data.title],
      data.subtitle ? [data.subtitle] : [],
      data.period ? [data.period] : [],
      [],
      ['Résumé'],
      ...data.summary.map(item => [item.label, item.value])
    ].filter(row => row.length > 0);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
  }

  // Créer une feuille pour chaque table
  if (data.tables && data.tables.length > 0) {
    data.tables.forEach((table, index) => {
      const tableData = [
        [table.title],
        [],
        table.headers,
        ...table.rows
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(tableData);
      
      // Ajuster la largeur des colonnes
      const cols = table.headers.map(() => ({ wch: 20 }));
      worksheet['!cols'] = cols;

      const sheetName = table.title.substring(0, 30); // Max 31 caractères pour Excel
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  }

  XLSX.writeFile(workbook, filename);
};

// Export en Word
export const exportToWord = async (data: ExportData, filename: string = 'rapport.docx') => {
  const sections: any[] = [];

  // Titre
  sections.push(
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 }
    })
  );

  if (data.subtitle) {
    sections.push(
      new Paragraph({
        text: data.subtitle,
        spacing: { after: 100 }
      })
    );
  }

  if (data.period) {
    sections.push(
      new Paragraph({
        text: data.period,
        spacing: { after: 200 }
      })
    );
  }

  // Résumé
  if (data.summary && data.summary.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Résumé',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    data.summary.forEach(item => {
      sections.push(
        new Paragraph({
          text: `${item.label}: ${item.value}`,
          spacing: { after: 50 }
        })
      );
    });
  }

  // Tables
  if (data.tables && data.tables.length > 0) {
    for (const table of data.tables) {
      sections.push(
        new Paragraph({
          text: table.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 }
        })
      );

      // Créer la table
      const tableRows = [
        // En-tête
        new TableRow({
          children: table.headers.map(
            header =>
              new TableCell({
                children: [
                  new Paragraph({ 
                    text: header,
                    style: 'Strong'
                  })
                ],
                shading: { fill: 'DDDDDD' }
              })
          )
        }),
        // Données
        ...table.rows.map(
          row =>
            new TableRow({
              children: row.map(
                cell =>
                  new TableCell({
                    children: [new Paragraph(String(cell))]
                  })
              )
            })
        )
      ];

      sections.push(
        new Table({
          rows: tableRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        children: sections
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Export CSV simple (pour compatibilité)
export const exportToCSV = (data: string[][], filename: string = 'export.csv') => {
  const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
