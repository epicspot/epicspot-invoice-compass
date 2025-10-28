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

// Génération automatique des codes produits
export const generateProductCode = (
  description: string,
  existingProducts: Array<{ reference: string; description: string }>
): string => {
  // Nettoyer et extraire les 3 premières lettres
  const cleanDescription = description
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, ''); // Garde seulement les lettres
  
  const prefix = cleanDescription.substring(0, 3).padEnd(3, 'X'); // Si moins de 3 lettres, complète avec X
  
  // Trouver tous les produits avec ce préfixe
  const samePrefixProducts = existingProducts.filter(p => 
    p.reference.startsWith(prefix)
  );
  
  // Trouver le numéro le plus élevé
  let maxNumber = 0;
  samePrefixProducts.forEach(p => {
    const match = p.reference.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  });
  
  // Générer le nouveau code
  const newNumber = maxNumber + 1;
  const paddedNumber = String(newNumber).padStart(3, '0');
  
  return `${prefix}-${paddedNumber}`;
};

// Génération automatique des codes clients
export const generateClientCode = (
  name: string,
  existingClients: Array<{ code?: string; name: string }>
): string => {
  const prefix = 'CLI';
  
  // Trouver tous les clients avec le préfixe CLI
  const cliClients = existingClients.filter(c => 
    c.code?.startsWith(prefix)
  );
  
  // Trouver le numéro le plus élevé
  let maxNumber = 0;
  cliClients.forEach(c => {
    if (c.code) {
      const match = c.code.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }
  });
  
  // Générer le nouveau code
  const newNumber = maxNumber + 1;
  const paddedNumber = String(newNumber).padStart(3, '0');
  
  return `${prefix}-${paddedNumber}`;
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};
