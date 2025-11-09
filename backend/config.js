/**
 * Configuration centralisée du backend
 * Ce fichier contient tous les ports et URLs utilisés par le backend
 */

export const APP_CONFIG = {
  // Ports
  FRONTEND_PORT: 5112,
  BACKEND_PORT: 3000,
  
  // URLs
  get FRONTEND_URL() {
    return `http://localhost:${this.FRONTEND_PORT}`;
  },
  
  get BACKEND_URL() {
    return `http://localhost:${this.BACKEND_PORT}`;
  },
  
  // Environnement
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Autres configurations
  APP_NAME: 'EPICSPOT Gestion Commerciale',
  APP_VERSION: '1.0.0',
};

export default APP_CONFIG;
