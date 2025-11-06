import db from '../database.js';
import { collectionSchema, validateSchema } from '../schemas/validation.js';

const validateCollection = validateSchema(collectionSchema);

export default async function collectionRoutes(fastify, options) {
  // Get all collections
  fastify.get('/', async (request, reply) => {
    try {
      const collections = db.prepare(`
        SELECT c.*, v.name as vendor_name, u.name as collector_name 
        FROM collections c
        LEFT JOIN vendors v ON c.vendor_id = v.id
        LEFT JOIN users u ON c.collector_id = u.id
        ORDER BY c.collection_date DESC, c.created_at DESC
      `).all();
      return collections;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get collection by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const collection = db.prepare(`
        SELECT c.*, v.name as vendor_name, u.name as collector_name 
        FROM collections c
        LEFT JOIN vendors v ON c.vendor_id = v.id
        LEFT JOIN users u ON c.collector_id = u.id
        WHERE c.id = ?
      `).get(id);
      
      if (!collection) {
        return reply.code(404).send({ error: 'Recouvrement non trouvé' });
      }
      
      return collection;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Create collection
  fastify.post('/', async (request, reply) => {
    try {
      const { vendorId, amount, collectionDate, collectorId, paymentMethod, notes } = request.body;
      
      if (!vendorId || !amount || !collectionDate || !collectorId || !paymentMethod) {
        return reply.code(400).send({ error: 'Tous les champs obligatoires doivent être remplis' });
      }

      const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(vendorId);
      if (!vendor) {
        return reply.code(404).send({ error: 'Vendeur non trouvé' });
      }

      const id = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert collection
      db.prepare(`
        INSERT INTO collections (id, vendor_id, amount, collection_date, collector_id, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, vendorId, amount, collectionDate, collectorId, paymentMethod, notes);
      
      // Update vendor balances
      const newPaidAmount = vendor.paid_amount + amount;
      const newRemainingBalance = vendor.remaining_balance - amount;
      
      db.prepare(`
        UPDATE vendors 
        SET paid_amount = ?, remaining_balance = ?
        WHERE id = ?
      `).run(newPaidAmount, newRemainingBalance, vendorId);
      
      const collection = db.prepare(`
        SELECT c.*, v.name as vendor_name, u.name as collector_name 
        FROM collections c
        LEFT JOIN vendors v ON c.vendor_id = v.id
        LEFT JOIN users u ON c.collector_id = u.id
        WHERE c.id = ?
      `).get(id);
      
      return collection;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update collection
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const { vendorId, amount, collectionDate, collectorId, paymentMethod, notes } = request.body;
      
      const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
      if (!collection) {
        return reply.code(404).send({ error: 'Recouvrement non trouvé' });
      }
      
      const oldAmount = collection.amount;
      const amountDifference = amount - oldAmount;
      
      // Update collection
      db.prepare(`
        UPDATE collections 
        SET vendor_id = ?, amount = ?, collection_date = ?, collector_id = ?, payment_method = ?, notes = ?
        WHERE id = ?
      `).run(vendorId, amount, collectionDate, collectorId, paymentMethod, notes, id);
      
      // Update vendor balances
      const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(vendorId);
      const newPaidAmount = vendor.paid_amount + amountDifference;
      const newRemainingBalance = vendor.remaining_balance - amountDifference;
      
      db.prepare(`
        UPDATE vendors 
        SET paid_amount = ?, remaining_balance = ?
        WHERE id = ?
      `).run(newPaidAmount, newRemainingBalance, vendorId);
      
      const updatedCollection = db.prepare(`
        SELECT c.*, v.name as vendor_name, u.name as collector_name 
        FROM collections c
        LEFT JOIN vendors v ON c.vendor_id = v.id
        LEFT JOIN users u ON c.collector_id = u.id
        WHERE c.id = ?
      `).get(id);
      
      return updatedCollection;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Delete collection
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
      if (!collection) {
        return reply.code(404).send({ error: 'Recouvrement non trouvé' });
      }
      
      // Update vendor balances
      const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(collection.vendor_id);
      const newPaidAmount = vendor.paid_amount - collection.amount;
      const newRemainingBalance = vendor.remaining_balance + collection.amount;
      
      db.prepare(`
        UPDATE vendors 
        SET paid_amount = ?, remaining_balance = ?
        WHERE id = ?
      `).run(newPaidAmount, newRemainingBalance, collection.vendor_id);
      
      db.prepare('DELETE FROM collections WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get collections by vendor
  fastify.get('/vendor/:vendorId', async (request, reply) => {
    try {
      const { vendorId } = request.params;
      const collections = db.prepare(`
        SELECT c.*, v.name as vendor_name, u.name as collector_name 
        FROM collections c
        LEFT JOIN vendors v ON c.vendor_id = v.id
        LEFT JOIN users u ON c.collector_id = u.id
        WHERE c.vendor_id = ?
        ORDER BY c.collection_date DESC, c.created_at DESC
      `).all(vendorId);
      return collections;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}
