import db from '../database.js';

export default async function productsRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    
    if (!product) {
      reply.code(404);
      return { error: 'Produit non trouvé' };
    }
    
    return product;
  });

  fastify.post('/', async (request, reply) => {
    const { description, unit_price, quantity, category } = request.body;
    
    if (!description || !unit_price) {
      reply.code(400);
      return { error: 'Description et prix sont requis' };
    }

    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reference = `PROD${Date.now().toString().slice(-6)}`;

    try {
      db.prepare(`
        INSERT INTO products (id, reference, description, unit_price, quantity, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, reference, description, unit_price, quantity || 0, category || '');

      return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création du produit' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { description, unit_price, quantity, category } = request.body;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      reply.code(404);
      return { error: 'Produit non trouvé' };
    }

    try {
      db.prepare(`
        UPDATE products 
        SET description = ?, unit_price = ?, quantity = ?, category = ?
        WHERE id = ?
      `).run(description, unit_price, quantity, category, id);

      return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour du produit' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      reply.code(404);
      return { error: 'Produit non trouvé' };
    }

    try {
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      return { success: true, message: 'Produit supprimé' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression du produit' };
    }
  });
}
