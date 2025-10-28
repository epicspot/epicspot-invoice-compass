import db from '../database.js';

export default async function remindersRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM reminders ORDER BY created_at DESC').all();
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    
    if (!reminder) {
      reply.code(404);
      return { error: 'Rappel non trouvé' };
    }
    
    return reminder;
  });

  fastify.post('/', async (request, reply) => {
    const { invoice_id, client_name, amount, status, next_reminder_date } = request.body;
    
    if (!invoice_id || !client_name || !amount) {
      reply.code(400);
      return { error: 'Données du rappel incomplètes' };
    }

    const id = `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      db.prepare(`
        INSERT INTO reminders (id, invoice_id, client_name, amount, status, next_reminder_date, attempts)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).run(id, invoice_id, client_name, amount, status || 'pending', next_reminder_date || null);

      return db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création du rappel' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { status, attempts, next_reminder_date, last_reminder_date } = request.body;

    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    if (!reminder) {
      reply.code(404);
      return { error: 'Rappel non trouvé' };
    }

    try {
      db.prepare(`
        UPDATE reminders 
        SET status = ?, attempts = ?, next_reminder_date = ?, last_reminder_date = ?
        WHERE id = ?
      `).run(status, attempts, next_reminder_date, last_reminder_date, id);

      return db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour du rappel' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    if (!reminder) {
      reply.code(404);
      return { error: 'Rappel non trouvé' };
    }

    try {
      db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
      return { success: true, message: 'Rappel supprimé' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression du rappel' };
    }
  });
}
