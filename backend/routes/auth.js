import db from '../database.js';
import crypto from 'crypto';

export default async function authRoutes(fastify) {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.code(400).send({ error: 'Email et mot de passe requis' });
      }

      // Hash du mot de passe
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // Rechercher l'utilisateur
      const user = db.prepare(`
        SELECT id, name, email, role, site_id, active 
        FROM users 
        WHERE email = ? AND password = ? AND active = 1
      `).get(email, hashedPassword);

      if (!user) {
        return reply.code(401).send({ error: 'Email ou mot de passe incorrect' });
      }

      // Créer une session (stocker dans le client)
      const sessionToken = crypto.randomBytes(32).toString('hex');
      
      return reply.send({
        success: true,
        user,
        token: sessionToken
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la connexion' });
    }
  });

  // Vérifier le token (optionnel pour validation)
  fastify.post('/verify', async (request, reply) => {
    try {
      const { userId } = request.body;

      if (!userId) {
        return reply.code(400).send({ error: 'User ID requis' });
      }

      const user = db.prepare(`
        SELECT id, name, email, role, site_id, active 
        FROM users 
        WHERE id = ? AND active = 1
      `).get(userId);

      if (!user) {
        return reply.code(401).send({ error: 'Session invalide' });
      }

      return reply.send({ success: true, user });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la vérification' });
    }
  });

  // Changer le mot de passe
  fastify.post('/change-password', async (request, reply) => {
    try {
      const { userId, oldPassword, newPassword } = request.body;

      if (!userId || !oldPassword || !newPassword) {
        return reply.code(400).send({ error: 'Tous les champs sont requis' });
      }

      const hashedOldPassword = crypto.createHash('sha256').update(oldPassword).digest('hex');
      const user = db.prepare('SELECT * FROM users WHERE id = ? AND password = ?').get(userId, hashedOldPassword);

      if (!user) {
        return reply.code(401).send({ error: 'Ancien mot de passe incorrect' });
      }

      const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedNewPassword, userId);

      return reply.send({ success: true, message: 'Mot de passe modifié avec succès' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors du changement de mot de passe' });
    }
  });
}
