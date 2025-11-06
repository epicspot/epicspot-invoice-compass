import db from '../database.js';

export default async function vendorRoutes(fastify, options) {
  // Get all vendors
  fastify.get('/', async (request, reply) => {
    try {
      const vendors = db.prepare('SELECT * FROM vendors ORDER BY created_at DESC').all();
      return vendors;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get vendor by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
      
      if (!vendor) {
        return reply.code(404).send({ error: 'Vendeur non trouvé' });
      }
      
      return vendor;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Create vendor
  fastify.post('/', async (request, reply) => {
    try {
      const { code, name, phone, email, address, siteId } = request.body;
      
      if (!name || !phone || !siteId) {
        return reply.code(400).send({ error: 'Le nom, téléphone et site sont requis' });
      }

      const id = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      db.prepare(`
        INSERT INTO vendors (id, code, name, phone, email, address, site_id, total_debt, paid_amount, remaining_balance, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 1)
      `).run(id, code, name, phone, email, address, siteId);
      
      const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
      return vendor;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update vendor
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const { code, name, phone, email, address, siteId, totalDebt, paidAmount, remainingBalance, active } = request.body;
      
      const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
      if (!vendor) {
        return reply.code(404).send({ error: 'Vendeur non trouvé' });
      }
      
      db.prepare(`
        UPDATE vendors 
        SET code = ?, name = ?, phone = ?, email = ?, address = ?, site_id = ?, 
            total_debt = ?, paid_amount = ?, remaining_balance = ?, active = ?
        WHERE id = ?
      `).run(code, name, phone, email, address, siteId, totalDebt, paidAmount, remainingBalance, active, id);
      
      const updatedVendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
      return updatedVendor;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Delete vendor
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
      if (!vendor) {
        return reply.code(404).send({ error: 'Vendeur non trouvé' });
      }
      
      db.prepare('DELETE FROM vendors WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get vendors by site
  fastify.get('/site/:siteId', async (request, reply) => {
    try {
      const { siteId } = request.params;
      const vendors = db.prepare('SELECT * FROM vendors WHERE site_id = ? ORDER BY created_at DESC').all(siteId);
      return vendors;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Add credit to vendor (when making a sale)
  fastify.post('/:id/add-credit', async (request, reply) => {
    try {
      const { id } = request.params;
      const { amount } = request.body;
      
      const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
      if (!vendor) {
        return reply.code(404).send({ error: 'Vendeur non trouvé' });
      }
      
      const newTotalDebt = vendor.total_debt + amount;
      const newRemainingBalance = vendor.remaining_balance + amount;
      
      db.prepare(`
        UPDATE vendors 
        SET total_debt = ?, remaining_balance = ?
        WHERE id = ?
      `).run(newTotalDebt, newRemainingBalance, id);
      
      const updatedVendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
      return updatedVendor;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}
