import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyInfo } from '@/lib/types';
import { useToast } from './use-toast';

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCompanyInfo({
          name: data.name,
          address: data.address,
          phone: data.phone || undefined,
          email: data.email || undefined,
          website: data.website || undefined,
          taxId: data.tax_id || undefined,
          bankAccount: data.bank_account || undefined,
          bankName: data.bank_name || undefined,
          bankIBAN: data.bank_iban || undefined,
          bankSwift: data.bank_swift || undefined,
          signatory: data.signatory || undefined,
          signatoryTitle: data.signatory_title || undefined,
          slogan: data.slogan || undefined,
          logo: data.logo || undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyInfo = async (updates: Partial<CompanyInfo>) => {
    try {
      const { data: existingData } = await supabase
        .from('company_info')
        .select('id')
        .single();

      const payload = {
        name: updates.name || companyInfo.name,
        address: updates.address || companyInfo.address,
        phone: updates.phone,
        email: updates.email,
        website: updates.website,
        tax_id: updates.taxId,
        bank_account: updates.bankAccount,
        bank_name: updates.bankName,
        bank_iban: updates.bankIBAN,
        bank_swift: updates.bankSwift,
        signatory: updates.signatory,
        signatory_title: updates.signatoryTitle,
        slogan: updates.slogan,
        logo: updates.logo,
        updated_at: new Date().toISOString(),
      };

      if (existingData) {
        const { error } = await supabase
          .from('company_info')
          .update(payload)
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_info')
          .insert([payload]);

        if (error) throw error;
      }

      setCompanyInfo({ ...companyInfo, ...updates });
      
      toast({
        title: "Informations sauvegardées",
        description: "Les informations de l'entreprise ont été mises à jour avec succès."
      });
    } catch (error) {
      console.error('Error saving company info:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les informations.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  return {
    companyInfo,
    loading,
    saveCompanyInfo,
    refetch: fetchCompanyInfo,
  };
}
