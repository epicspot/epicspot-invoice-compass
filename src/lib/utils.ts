import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour formater les montants en FCFA avec séparateur de milliers
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Fonction pour formater avec FCFA et séparateur de milliers (espaces)
export function formatFCFA(amount: number): string {
  // Utiliser des espaces normaux au lieu d'espaces insécables pour compatibilité PDF
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace(/\u00A0/g, ' '); // Remplacer espaces insécables par espaces normaux
  
  return `${formatted} FCFA`;
}
