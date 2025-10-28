import { useLocalStorage } from './useLocalStorage';
import { CompanyInfo } from '@/lib/types';

const initialCompanyInfo: CompanyInfo = {
  name: 'EPICSPOT_CONSULTING',
  address: 'Abidjan, Côte d\'Ivoire',
  phone: '+225 XX XX XX XX',
  email: 'contact@epicspot.com',
  taxId: 'RC: XXXXXXX - IF: XXXXXXX',
};

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('companyInfo', initialCompanyInfo);

  const updateCompanyInfo = (updates: Partial<CompanyInfo>) => {
    setCompanyInfo({ ...companyInfo, ...updates });
  };

  return {
    companyInfo,
    updateCompanyInfo,
  };
}
