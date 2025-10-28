import db from '../database.js';

export default async function stockMovementsRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM stock_movements ORDER BY date DESC').all();
  });

  fastify.get('/product/:productId', async (request) => {
    const { productId } = request.params;
    return db.prepare('SELECT * FROM stock_movements WHERE product_id = ? ORDER BY date DESC').all(productId);
  });

  fastify.get('/site/:siteId', async (request) => {
    const { siteId } = request.params;
    return db.prepare('SELECT * FROM stock_movements WHERE site_id = ? ORDER BY date DESC').all(siteId);
  });

  fastify.get('/stock/:productId/:siteId', async (request) => {
    const { productId, siteId } = request.params;
    const movements = db.prepare('SELECT * FROM stock_movements WHERE product_id = ? AND site_id = ?').all(productId, siteId);
    const currentStock = movements.reduce((total, m) => total + m.quantity, 0);
    return { currentStock, movements };
  });

  fastify.post('/', async (request, reply) => {
    const { product_id, site_id, quantity, type, reference, notes } = request.body;
    
    if (!product_id || !site_id || !quantity || !type) {
      reply.code(400);
      return { error: 'Données du mouvement incomplètes' };
    }

    const id = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      db.prepare(`
        INSERT INTO stock_movements (id, product_id, site_id, quantity, type, reference, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, product_id, site_id, quantity, type, reference || '', notes || '');

      return db.prepare('SELECT * FROM stock_movements WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création du mouvement de stock' };
    }
  });
}
