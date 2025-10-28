// Génération automatique des numéros de série annuels

export const generateDocumentNumber = (
  type: 'invoice' | 'quote',
  existingDocuments: Array<{ number: string; date: string }>
): string => {
  const currentYear = new Date().getFullYear();
  const prefix = type === 'invoice' 
    ? (localStorage.getItem('invoicePrefix') || 'FACT')
    : (localStorage.getItem('quotePrefix') || 'DEVIS');
  
  // Filtrer les documents de l'année en cours
  const currentYearDocs = existingDocuments.filter(doc => {
    const docYear = new Date(doc.date).getFullYear();
    return docYear === currentYear && doc.number.startsWith(prefix);
  });
  
  // Trouver le numéro le plus élevé de l'année
  let maxNumber = 0;
  currentYearDocs.forEach(doc => {
    // Extraire le numéro de la fin (ex: FACT-2025-123 -> 123)
    const match = doc.number.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  });
  
  // Générer le nouveau numéro
  const newNumber = maxNumber + 1;
  const paddedNumber = String(newNumber).padStart(3, '0');
  
  return `${prefix}-${currentYear}-${paddedNumber}`;
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};
