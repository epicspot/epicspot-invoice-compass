import db from '../database.js';

export default async function invoicesRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all()
      .map(inv => ({ ...inv, items: JSON.parse(inv.items) }));
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    
    if (!invoice) {
      reply.code(404);
      return { error: 'Facture non trouvée' };
    }
    
    return { ...invoice, items: JSON.parse(invoice.items) };
  });

  fastify.post('/', async (request, reply) => {
    const { client_id, date, items, total, tax, status, paid_amount } = request.body;
    
    if (!client_id || !items || items.length === 0) {
      reply.code(400);
      return { error: 'Client et articles requis' };
    }

    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const number = `INV${Date.now().toString().slice(-8)}`;

    try {
      db.prepare(`
        INSERT INTO invoices (id, number, client_id, date, items, total, tax, status, paid_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, number, client_id, date, JSON.stringify(items), total, tax || 0, status || 'pending', paid_amount || 0);

      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
      return { ...invoice, items: JSON.parse(invoice.items) };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création de la facture' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { client_id, date, items, total, tax, status, paid_amount } = request.body;

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) {
      reply.code(404);
      return { error: 'Facture non trouvée' };
    }

    try {
      db.prepare(`
        UPDATE invoices 
        SET client_id = ?, date = ?, items = ?, total = ?, tax = ?, status = ?, paid_amount = ?
        WHERE id = ?
      `).run(client_id, date, JSON.stringify(items), total, tax, status, paid_amount, id);

      const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
      return { ...updated, items: JSON.parse(updated.items) };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour de la facture' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) {
      reply.code(404);
      return { error: 'Facture non trouvée' };
    }

    try {
      db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
      return { success: true, message: 'Facture supprimée' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression de la facture' };
    }
  });
}
