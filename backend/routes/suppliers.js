import db from '../database.js';
import { supplierSchema, validateSchema } from '../schemas/validation.js';

const validateSupplier = validateSchema(supplierSchema);

export default async function suppliersRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM suppliers ORDER BY created_at DESC').all();
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    
    if (!supplier) {
      reply.code(404);
      return { error: 'Fournisseur non trouvé' };
    }
    
    return supplier;
  });

  fastify.post('/', async (request, reply) => {
    const validation = validateSupplier(request.body);
    
    if (!validation.success) {
      reply.code(400);
      return { error: 'Données invalides', details: validation.errors };
    }

    const { name, address, phone, email, vat_number } = validation.data;

    const id = `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const code = `SUP${Date.now().toString().slice(-6)}`;

    try {
      db.prepare(`
        INSERT INTO suppliers (id, code, name, address, phone, email, vat_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, code, name, address || '', phone || '', email || '', vat_number || '');

      return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la création du fournisseur' };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, address, phone, email, vat_number } = request.body;

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      reply.code(404);
      return { error: 'Fournisseur non trouvé' };
    }

    try {
      db.prepare(`
        UPDATE suppliers 
        SET name = ?, address = ?, phone = ?, email = ?, vat_number = ?
        WHERE id = ?
      `).run(name, address, phone, email, vat_number, id);

      return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour du fournisseur' };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      reply.code(404);
      return { error: 'Fournisseur non trouvé' };
    }

    try {
      db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
      return { success: true, message: 'Fournisseur supprimé' };
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la suppression du fournisseur' };
    }
  });
}
