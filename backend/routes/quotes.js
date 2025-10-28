import db from '../database.js';

export default async function quotesRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all()
      .map(quote => ({ ...quote, items: JSON.parse(quote.items) }));
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    
    if (!quote) {
      reply.code(404);
      return { error: 'Devis non trouvé' };
    }
    
    return { ...quote, items: JSON.parse(quote.items) };
  });

  fastify.post('/', async (request, reply) => {
    const { client_id, date, items, total, tax, status } = request.body;
    
    if (!client_id || !items || items.length === 0) {
      reply.code(400);
      return { error: 'Client et articles requis' };
    }

    const id = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const number = `QUOTE${Date.now().toString().slice(-8)}`;

    try {
      db.prepare(`
        INSERT INTO quotes (id, number, client_id, date, items, total, tax, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, number, client_id, date, JSON.stringify(items), total, tax || 0, status || 'pending');

      const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
      return { ...quote, items: JSON.parse(quote.items) };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création du devis' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { client_id, date, items, total, tax, status } = request.body;

    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    if (!quote) {
      reply.code(404);
      return { error: 'Devis non trouvé' };
    }

    try {
      db.prepare(`
        UPDATE quotes 
        SET client_id = ?, date = ?, items = ?, total = ?, tax = ?, status = ?
        WHERE id = ?
      `).run(client_id, date, JSON.stringify(items), total, tax, status, id);

      const updated = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
      return { ...updated, items: JSON.parse(updated.items) };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour du devis' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    if (!quote) {
      reply.code(404);
      return { error: 'Devis non trouvé' };
    }

    try {
      db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
      return { success: true, message: 'Devis supprimé' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression du devis' };
    }
  });
}
