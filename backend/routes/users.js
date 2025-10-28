import db from '../database.js';

export default async function usersRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!user) {
      reply.code(404);
      return { error: 'Utilisateur non trouvé' };
    }
    
    return user;
  });

  fastify.post('/', async (request, reply) => {
    const { name, email, role, site_id, active } = request.body;
    
    if (!name || !email || !role) {
      reply.code(400);
      return { error: 'Nom, email et rôle sont requis' };
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      db.prepare(`
        INSERT INTO users (id, name, email, role, site_id, active)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, name, email, role, site_id || '', active !== false ? 1 : 0);

      return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création de l\'utilisateur' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, email, role, site_id, active } = request.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      reply.code(404);
      return { error: 'Utilisateur non trouvé' };
    }

    try {
      db.prepare(`
        UPDATE users 
        SET name = ?, email = ?, role = ?, site_id = ?, active = ?
        WHERE id = ?
      `).run(name, email, role, site_id, active !== false ? 1 : 0, id);

      return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      reply.code(404);
      return { error: 'Utilisateur non trouvé' };
    }

    try {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      return { success: true, message: 'Utilisateur supprimé' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression de l\'utilisateur' };
    }
  });
}
