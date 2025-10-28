import db from '../database.js';

export default async function leadsRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    
    if (!lead) {
      reply.code(404);
      return { error: 'Lead non trouvé' };
    }
    
    return lead;
  });

  fastify.post('/', async (request, reply) => {
    const { name, company, phone, email, address, status, notes } = request.body;
    
    if (!name || !phone) {
      reply.code(400);
      return { error: 'Nom et téléphone sont requis' };
    }

    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      db.prepare(`
        INSERT INTO leads (id, name, company, phone, email, address, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, company || '', phone, email || '', address || '', status || 'new', notes || '');

      return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création du lead' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, company, phone, email, address, status, notes } = request.body;

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!lead) {
      reply.code(404);
      return { error: 'Lead non trouvé' };
    }

    try {
      db.prepare(`
        UPDATE leads 
        SET name = ?, company = ?, phone = ?, email = ?, address = ?, status = ?, notes = ?
        WHERE id = ?
      `).run(name, company, phone, email, address, status, notes, id);

      return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour du lead' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!lead) {
      reply.code(404);
      return { error: 'Lead non trouvé' };
    }

    try {
      db.prepare('DELETE FROM leads WHERE id = ?').run(id);
      return { success: true, message: 'Lead supprimé' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression du lead' };
    }
  });
}
