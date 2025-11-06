import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentSignature {
  id: string;
  document_type: string;
  document_id: string;
  user_id: string;
  user_email: string;
  signature_data: string;
  ip_address: string | null;
  signed_at: string;
  metadata: any;
}

export function useDocumentSignature() {
  const [loading, setLoading] = useState(false);

  const signDocument = async (
    documentType: string,
    documentId: string,
    signatureData: string,
    metadata?: any
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('document_signatures')
        .insert({
          document_type: documentType,
          document_id: documentId,
          user_id: user.id,
          user_email: user.email!,
          signature_data: signatureData,
          metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing document:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentSignatures = async (documentType: string, documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('document_type', documentType)
        .eq('document_id', documentId)
        .order('signed_at', { ascending: false });

      if (error) throw error;
      return data as DocumentSignature[];
    } catch (error) {
      console.error('Error fetching signatures:', error);
      return [];
    }
  };

  const verifySignature = async (signatureId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('id', signatureId)
        .single();

      if (error) throw error;
      return data as DocumentSignature;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return null;
    }
  };

  return {
    loading,
    signDocument,
    getDocumentSignatures,
    verifySignature
  };
}
