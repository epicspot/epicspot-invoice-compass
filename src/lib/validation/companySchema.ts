import { z } from 'zod';

// Regex patterns for validation
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const companyInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom de l'entreprise est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  
  address: z
    .string()
    .trim()
    .min(1, "L'adresse est requise")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères"),
  
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val),
      "Format de téléphone invalide (ex: +225 XX XX XX XX)"
    ),
  
  email: z
    .string()
    .trim()
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
    .optional()
    .or(z.literal('')),
  
  website: z
    .string()
    .trim()
    .url("Format d'URL invalide")
    .max(255, "L'URL ne peut pas dépasser 255 caractères")
    .optional()
    .or(z.literal('')),
  
  taxId: z
    .string()
    .trim()
    .max(100, "Le numéro fiscal ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal('')),
  
  bankAccount: z
    .string()
    .trim()
    .max(50, "Le numéro de compte ne peut pas dépasser 50 caractères")
    .optional()
    .or(z.literal('')),
  
  bankName: z
    .string()
    .trim()
    .max(100, "Le nom de la banque ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal('')),
  
  bankIBAN: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || ibanRegex.test(val.replace(/\s/g, '')),
      "Format IBAN invalide (ex: FR76 XXXX XXXX XXXX XXXX XXXX XXX)"
    )
    .or(z.literal('')),
  
  bankSwift: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || swiftRegex.test(val.toUpperCase()),
      "Format SWIFT/BIC invalide (8 ou 11 caractères)"
    )
    .or(z.literal('')),
  
  signatory: z
    .string()
    .trim()
    .max(100, "Le nom du signataire ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal('')),
  
  signatoryTitle: z
    .string()
    .trim()
    .max(100, "Le titre ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal('')),
  
  slogan: z
    .string()
    .trim()
    .max(200, "Le slogan ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal('')),
  
  logo: z.string().optional(),
});

export const siteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom du site est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  
  address: z
    .string()
    .trim()
    .min(1, "L'adresse est requise")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères"),
  
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val),
      "Format de téléphone invalide"
    )
    .or(z.literal('')),
  
  email: z
    .string()
    .trim()
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
    .optional()
    .or(z.literal('')),
  
  isMainSite: z.boolean().default(false),
  
  useHeadquartersInfo: z.boolean().default(true),
  
  taxId: z
    .string()
    .trim()
    .max(100, "Le numéro fiscal ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal('')),
  
  bankAccount: z
    .string()
    .trim()
    .max(50, "Le numéro de compte ne peut pas dépasser 50 caractères")
    .optional()
    .or(z.literal('')),
  
  bankName: z
    .string()
    .trim()
    .max(100, "Le nom de la banque ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal('')),
  
  bankIBAN: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || ibanRegex.test(val.replace(/\s/g, '')),
      "Format IBAN invalide"
    )
    .or(z.literal('')),
  
  bankSwift: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || swiftRegex.test(val.toUpperCase()),
      "Format SWIFT/BIC invalide"
    )
    .or(z.literal('')),
});

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;
export type SiteFormData = z.infer<typeof siteSchema>;
