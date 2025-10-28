import db from '../database.js';

export default async function companyRoutes(fastify) {
  fastify.get('/', async () => {
    return db.prepare('SELECT * FROM company_info WHERE id = 1').get();
  });

  fastify.put('/', async (request, reply) => {
    const { name, address, phone, email, tax_id } = request.body;

    try {
      db.prepare(`
        UPDATE company_info 
        SET name = ?, address = ?, phone = ?, email = ?, tax_id = ?
        WHERE id = 1
      `).run(name, address, phone, email, tax_id);

      return db.prepare('SELECT * FROM company_info WHERE id = 1').get();
    } catch (error) {
      reply.code(500);
      return { error: 'Erreur lors de la mise à jour des informations de l\'entreprise' };
    }
  });
}
