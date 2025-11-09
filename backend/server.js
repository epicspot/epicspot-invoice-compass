import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import db from './database.js';
import { APP_CONFIG } from './config.js';

// Import routes
import authRoutes from './routes/auth.js';
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
import vendorRoutes from './routes/vendors.js';
import collectionRoutes from './routes/collections.js';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Configuration CORS
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || APP_CONFIG.FRONTEND_URL,
  credentials: true
});

// Note: Swagger documentation will be added in a future update
// For now, the API endpoints are available at /api/*

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Enregistrer les routes
fastify.register(authRoutes, { prefix: '/api/auth' });
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
fastify.register(vendorRoutes, { prefix: '/api/vendors' });
fastify.register(collectionRoutes, { prefix: '/api/collections' });

// Démarrer le serveur
const start = async () => {
  try {
    const port = process.env.PORT || APP_CONFIG.BACKEND_PORT;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Serveur démarré sur ${APP_CONFIG.BACKEND_URL}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
