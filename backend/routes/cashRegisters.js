import db from '../database.js';

export default async function cashRegistersRoutes(fastify) {
  // Caisses
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM cash_registers ORDER BY created_at DESC').all();
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const register = db.prepare('SELECT * FROM cash_registers WHERE id = ?').get(id);
    
    if (!register) {
      reply.code(404);
      return { error: 'Caisse non trouvée' };
    }
    
    return register;
  });

  fastify.post('/', async (request, reply) => {
    const { name, site_id, initial_amount } = request.body;
    
    if (!name || !site_id) {
      reply.code(400);
      return { error: 'Nom et site requis' };
    }

    const id = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      db.prepare(`
        INSERT INTO cash_registers (id, name, site_id, initial_amount, current_amount, status)
        VALUES (?, ?, ?, ?, ?, 'open')
      `).run(id, name, site_id, initial_amount || 0, initial_amount || 0);

      return db.prepare('SELECT * FROM cash_registers WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création de la caisse' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, site_id, initial_amount, current_amount, status, last_reconciled } = request.body;

    const register = db.prepare('SELECT * FROM cash_registers WHERE id = ?').get(id);
    if (!register) {
      reply.code(404);
      return { error: 'Caisse non trouvée' };
    }

    try {
      db.prepare(`
        UPDATE cash_registers 
        SET name = ?, site_id = ?, initial_amount = ?, current_amount = ?, status = ?, last_reconciled = ?
        WHERE id = ?
      `).run(name, site_id, initial_amount, current_amount, status, last_reconciled, id);

      return db.prepare('SELECT * FROM cash_registers WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour de la caisse' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const register = db.prepare('SELECT * FROM cash_registers WHERE id = ?').get(id);
    if (!register) {
      reply.code(404);
      return { error: 'Caisse non trouvée' };
    }

    try {
      db.prepare('DELETE FROM cash_registers WHERE id = ?').run(id);
      return { success: true, message: 'Caisse supprimée' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression de la caisse' };
    }
  });

  // Transactions
  fastify.get('/:registerId/transactions', async (request) => {
    const { registerId } = request.params;
    return db.prepare('SELECT * FROM cash_transactions WHERE cash_register_id = ? ORDER BY date DESC').all(registerId);
  });

  fastify.post('/:registerId/transactions', async (request, reply) => {
    const { registerId } = request.params;
    const { amount, type, notes, user_id } = request.body;

    const register = db.prepare('SELECT * FROM cash_registers WHERE id = ?').get(registerId);
    if (!register) {
      reply.code(404);
      return { error: 'Caisse non trouvée' };
    }

    const id = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      db.prepare(`
        INSERT INTO cash_transactions (id, cash_register_id, amount, type, notes, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, registerId, amount, type, notes || '', user_id || '');

      // Update register amount
      const newAmount = register.current_amount + amount;
      db.prepare('UPDATE cash_registers SET current_amount = ? WHERE id = ?').run(newAmount, registerId);

      return db.prepare('SELECT * FROM cash_transactions WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création de la transaction' };
    }
  });
}
