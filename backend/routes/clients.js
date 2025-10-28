import db from '../database.js';

export default async function clientsRoutes(fastify) {
  // GET all clients
  fastify.get('/', async () => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    return clients;
  });

  // GET client by id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    
    if (!client) {
      reply.code(404);
      return { error: 'Client non trouvé' };
    }
    
    return client;
  });

  // POST create client
  fastify.post('/', async (request, reply) => {
    const { name, address, phone, email } = request.body;
    
    if (!name) {
      reply.code(400);
      return { error: 'Le nom est requis' };
    }

    const id = `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const code = `CLI${Date.now().toString().slice(-6)}`;

    try {
      db.prepare(`
        INSERT INTO clients (id, code, name, address, phone, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, code, name, address || '', phone || '', email || '');

      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      return client;
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création du client' };
    }
  });

  // PUT update client
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, address, phone, email } = request.body;

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!client) {
      reply.code(404);
      return { error: 'Client non trouvé' };
    }

    try {
      db.prepare(`
        UPDATE clients 
        SET name = ?, address = ?, phone = ?, email = ?
        WHERE id = ?
      `).run(name, address, phone, email, id);

      const updatedClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      return updatedClient;
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour du client' };
    }
  });

  // DELETE client
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!client) {
      reply.code(404);
      return { error: 'Client non trouvé' };
    }

    try {
      db.prepare('DELETE FROM clients WHERE id = ?').run(id);
      return { success: true, message: 'Client supprimé' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression du client' };
    }
  });
}
