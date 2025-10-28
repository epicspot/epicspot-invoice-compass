import db from '../database.js';

export default async function purchaseOrdersRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM purchase_orders ORDER BY created_at DESC').all()
      .map(po => ({ ...po, items: JSON.parse(po.items) }));
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
    
    if (!po) {
      reply.code(404);
      return { error: 'Bon de commande non trouvé' };
    }
    
    return { ...po, items: JSON.parse(po.items) };
  });

  fastify.post('/', async (request, reply) => {
    const { number, supplier_id, order_date, expected_delivery_date, items, total, status } = request.body;
    
    if (!supplier_id || !items || items.length === 0) {
      reply.code(400);
      return { error: 'Fournisseur et articles requis' };
    }

    const id = `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      db.prepare(`
        INSERT INTO purchase_orders (id, number, supplier_id, order_date, expected_delivery_date, items, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, number, supplier_id, order_date, expected_delivery_date, JSON.stringify(items), total, status || 'pending');

      const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
      return { ...po, items: JSON.parse(po.items) };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création du bon de commande' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { number, supplier_id, order_date, expected_delivery_date, items, total, status } = request.body;

    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
    if (!po) {
      reply.code(404);
      return { error: 'Bon de commande non trouvé' };
    }

    try {
      db.prepare(`
        UPDATE purchase_orders 
        SET number = ?, supplier_id = ?, order_date = ?, expected_delivery_date = ?, items = ?, total = ?, status = ?
        WHERE id = ?
      `).run(number, supplier_id, order_date, expected_delivery_date, JSON.stringify(items), total, status, id);

      const updated = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
      return { ...updated, items: JSON.parse(updated.items) };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour du bon de commande' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
    if (!po) {
      reply.code(404);
      return { error: 'Bon de commande non trouvé' };
    }

    try {
      db.prepare('DELETE FROM purchase_orders WHERE id = ?').run(id);
      return { success: true, message: 'Bon de commande supprimé' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression du bon de commande' };
    }
  });
}
