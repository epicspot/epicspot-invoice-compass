import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import db from './database.js';

// Import routes
import clientsRoutes from './routes/clients.js';
import productsRoutes from './routes/products.js';
import suppliersRoutes from './routes/suppliers.js';
import usersRoutes from './routes/users.js';
import quotesRoutes from './routes/quotes.js';
import invoicesRoutes from './routes/invoices.js';
import purchaseOrdersRoutes from './routes/purchaseOrders.js';
import leadsRoutes from './routes/leads.js';
import remindersRoutes from './routes/reminders.js';
import cashRegistersRoutes from './routes/cashRegisters.js';
import stockMovementsRoutes from './routes/stockMovements.js';
import companyRoutes from './routes/company.js';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Configuration CORS
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Enregistrer les routes
fastify.register(clientsRoutes, { prefix: '/api/clients' });
fastify.register(productsRoutes, { prefix: '/api/products' });
fastify.register(suppliersRoutes, { prefix: '/api/suppliers' });
fastify.register(usersRoutes, { prefix: '/api/users' });
fastify.register(quotesRoutes, { prefix: '/api/quotes' });
fastify.register(invoicesRoutes, { prefix: '/api/invoices' });
fastify.register(purchaseOrdersRoutes, { prefix: '/api/purchase-orders' });
fastify.register(leadsRoutes, { prefix: '/api/leads' });
fastify.register(remindersRoutes, { prefix: '/api/reminders' });
fastify.register(cashRegistersRoutes, { prefix: '/api/cash-registers' });
fastify.register(stockMovementsRoutes, { prefix: '/api/stock-movements' });
fastify.register(companyRoutes, { prefix: '/api/company' });

// Démarrer le serveur
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
