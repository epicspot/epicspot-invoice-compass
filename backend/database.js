import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'epicspot.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Créer les tables
export function initDatabase() {
  // Table clients
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table suppliers
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      vat_number TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      site_id TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table quotes
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      client_id TEXT NOT NULL,
      date TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      tax REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Table invoices
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      client_id TEXT NOT NULL,
      date TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      tax REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      paid_amount REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Table purchase_orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      order_date TEXT NOT NULL,
      expected_delivery_date TEXT,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    )
  `);

  // Table leads
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table reminders
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      next_reminder_date TEXT,
      last_reminder_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )
  `);

  // Table cash_registers
  db.exec(`
    CREATE TABLE IF NOT EXISTS cash_registers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      site_id TEXT NOT NULL,
      initial_amount REAL NOT NULL,
      current_amount REAL NOT NULL,
      status TEXT DEFAULT 'open',
      last_reconciled TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table cash_transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS cash_transactions (
      id TEXT PRIMARY KEY,
      cash_register_id TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      notes TEXT,
      user_id TEXT,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id) ON DELETE CASCADE
    )
  `);

  // Table stock_movements
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      type TEXT NOT NULL,
      reference TEXT,
      notes TEXT,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Table company_info
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      tax_id TEXT
    )
  `);

  // Insérer les données par défaut pour company_info
  const companyExists = db.prepare('SELECT COUNT(*) as count FROM company_info').get();
  if (companyExists.count === 0) {
    db.prepare(`
      INSERT INTO company_info (id, name, address, phone, email, tax_id)
      VALUES (1, 'EPICSPOT_CONSULTING', 'Abidjan, Côte d''Ivoire', '+225 XX XX XX XX', 'contact@epicspot.com', 'RC: XXXXXXX - IF: XXXXXXX')
    `).run();
  }

  console.log('✅ Base de données initialisée avec succès');
}

// Initialiser la base au démarrage
initDatabase();

export default db;
