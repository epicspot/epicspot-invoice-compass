import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder } from '@/lib/types';

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers:supplier_id (
            id,
            name,
            phone,
            email,
            address,
            contact_person
          ),
          purchase_order_items (
            id,
            quantity,
            amount,
            products:product_id (
              id,
              reference,
              description,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: PurchaseOrder[] = (data || []).map((po: any) => ({
        id: po.id,
        number: po.number,
        date: po.date,
        supplier: {
          id: po.suppliers.id,
          name: po.suppliers.name,
          phone: po.suppliers.phone,
          email: po.suppliers.email,
          address: po.suppliers.address,
          contactPerson: po.suppliers.contact_person,
          active: true,
          createdAt: po.created_at,
        },
        items: (po.purchase_order_items || []).map((item: any) => ({
          id: item.id,
          product: {
            id: item.products.id,
            reference: item.products.reference,
            description: item.products.description,
            price: item.products.price,
          },
          quantity: item.quantity,
          unitPrice: item.products.price,
          amount: item.amount,
        })),
        subtotal: po.subtotal,
        tax: po.tax,
        total: po.total,
        status: po.status,
        expectedDeliveryDate: po.expected_delivery_date,
        receivedDate: po.received_date,
        notes: po.notes,
        siteId: po.site_id,
      }));

      setPurchaseOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('purchase-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_orders'
        },
        () => {
          fetchPurchaseOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_order_items'
        },
        () => {
          fetchPurchaseOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addPurchaseOrder = async (order: Omit<PurchaseOrder, 'id'>) => {
    try {
      // Insert purchase order
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          number: order.number,
          date: order.date,
          supplier_id: order.supplier.id,
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          status: order.status,
          expected_delivery_date: order.expectedDeliveryDate,
          received_date: order.receivedDate,
          notes: order.notes,
          site_id: order.siteId,
        })
        .select()
        .single();

      if (poError) throw poError;

      // Insert items
      if (order.items && order.items.length > 0) {
        const itemsToInsert = order.items.map(item => ({
          purchase_order_id: poData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      await fetchPurchaseOrders();
      return { success: true, data: poData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la création' 
      };
    }
  };

  const updatePurchaseOrder = async (id: string, updatedOrder: Partial<PurchaseOrder>) => {
    try {
      // Update purchase order
      const { error: poError } = await supabase
        .from('purchase_orders')
        .update({
          number: updatedOrder.number,
          date: updatedOrder.date,
          supplier_id: updatedOrder.supplier?.id,
          subtotal: updatedOrder.subtotal,
          tax: updatedOrder.tax,
          total: updatedOrder.total,
          status: updatedOrder.status,
          expected_delivery_date: updatedOrder.expectedDeliveryDate,
          received_date: updatedOrder.receivedDate,
          notes: updatedOrder.notes,
          site_id: updatedOrder.siteId,
        })
        .eq('id', id);

      if (poError) throw poError;

      // Delete existing items and insert new ones
      if (updatedOrder.items) {
        await supabase
          .from('purchase_order_items')
          .delete()
          .eq('purchase_order_id', id);

        if (updatedOrder.items.length > 0) {
          const itemsToInsert = updatedOrder.items.map(item => ({
            purchase_order_id: id,
            product_id: item.product.id,
            quantity: item.quantity,
            amount: item.amount,
          }));

          const { error: itemsError } = await supabase
            .from('purchase_order_items')
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }
      }

      await fetchPurchaseOrders();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la modification' 
      };
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPurchaseOrders();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression' 
      };
    }
  };

  return {
    purchaseOrders,
    loading,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    refetch: fetchPurchaseOrders,
  };
}
