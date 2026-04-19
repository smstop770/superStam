import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(__dirname, '..', 'data', 'store.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seedData();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      parent_id TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      original_price REAL,
      images TEXT DEFAULT '[]',
      stock INTEGER DEFAULT 100,
      variants TEXT DEFAULT '[]',
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT DEFAULT '',
      customer_address TEXT DEFAULT '',
      customer_city TEXT DEFAULT '',
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL DEFAULT 0,
      total REAL NOT NULL,
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      webhook_sent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
}

function seedData() {
  const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admin_users').get() as { c: number }).c;
  if (adminCount === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)').run(uuidv4(), username, hash);
  }

  const settingsCount = (db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number }).c;
  if (settingsCount === 0) {
    const defaults = [
      ['site_name', 'סופר סת"ם'],
      ['site_subtitle', 'ספרי תורה, תפילין ומזוזות באיכות הגבוהה ביותר'],
      ['phone', '050-0000000'],
      ['email', 'info@super-stam.co.il'],
      ['whatsapp', '9720500000000'],
      ['free_shipping_above', '300'],
      ['shipping_cost', '30'],
      ['order_webhook_url', process.env.ORDER_WEBHOOK_URL || ''],
    ];
    const ins = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of defaults) ins.run(k, v);
  }

  const catCount = (db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number }).c;
  if (catCount > 0) return;

  const cats = [
    { id: 'cat-tefillin', name: 'תפילין', slug: 'tefillin', description: 'תפילין מהודרים בהשגחה קפדנית', sort_order: 1 },
    { id: 'cat-mezuzot', name: 'מזוזות', slug: 'mezuzot', description: 'מזוזות כשרות לכל המהדרין', sort_order: 2 },
    { id: 'cat-tallitot', name: 'טליתות', slug: 'tallitot', description: 'טליתות לכל גיל ועדה', sort_order: 3 },
    { id: 'cat-kippot', name: 'כיפות', slug: 'kippot', description: 'כיפות מגוונות', sort_order: 4 },
    { id: 'cat-books', name: 'ספרים', slug: 'books', description: 'סידורים, חומשים וספרי קודש', sort_order: 5 },
    // Sub-categories
    { id: 'cat-tefillin-ash', name: 'תפילין אשכנז', slug: 'tefillin-ashkenaz', description: 'תפילין נוסח אשכנז', sort_order: 1, parent_id: 'cat-tefillin' },
    { id: 'cat-tefillin-sep', name: 'תפילין ספרד', slug: 'tefillin-sephardi', description: 'תפילין נוסח ספרד', sort_order: 2, parent_id: 'cat-tefillin' },
    { id: 'cat-mez-large', name: 'מזוזות גדולות', slug: 'mezuzot-large', description: 'מזוזות לפתח ראשי', sort_order: 1, parent_id: 'cat-mezuzot' },
    { id: 'cat-mez-small', name: 'מזוזות קטנות', slug: 'mezuzot-small', description: 'מזוזות לחדרים', sort_order: 2, parent_id: 'cat-mezuzot' },
    { id: 'cat-tallit-gadol', name: 'טלית גדול', slug: 'tallit-gadol', description: 'טלית לגברים', sort_order: 1, parent_id: 'cat-tallitot' },
    { id: 'cat-tallit-katan', name: 'טלית קטן', slug: 'tallit-katan', description: 'ציצית לכל היום', sort_order: 2, parent_id: 'cat-tallitot' },
  ];

  const insC = db.prepare(`INSERT INTO categories (id, name, slug, description, sort_order, parent_id) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const c of cats) insC.run(c.id, c.name, c.slug, c.description, c.sort_order, (c as any).parent_id || null);

  const products = [
    {
      id: 'p1', category_id: 'cat-tefillin-ash', name: 'תפילין גסות אשכנז - מהודר',
      slug: 'tefillin-gasot-ashkenaz-mehudar', description: 'תפילין גסות בכתיבת סת"ם מהודרת. הגידין ידניים, הבתים מעור אחד. בדיקה דיגיטלית ובדיקת מומחה.',
      price: 1200, original_price: 1400, stock: 15, is_featured: 1,
      variants: JSON.stringify([{ name: 'סוג', options: ['רש"י', 'ר"ת', 'שניהם'] }])
    },
    {
      id: 'p2', category_id: 'cat-tefillin-sep', name: 'תפילין דקות ספרד - כשר',
      slug: 'tefillin-dakot-sephardi', description: 'תפילין דקות לנוסח ספרד. כשרות למהדרין עם אישור רב.',
      price: 850, stock: 20, is_featured: 1,
      variants: JSON.stringify([{ name: 'גודל', options: ['רגיל'] }])
    },
    {
      id: 'p3', category_id: 'cat-mez-large', name: 'מזוזה גדולה 15 ס"מ - מהודר',
      slug: 'mezuza-large-15-mehudar', description: 'פרשת מזוזה בגודל 15 ס"מ. כתיבת בית יוסף. בדיקה כפולה.',
      price: 280, original_price: 320, stock: 50, is_featured: 1,
      variants: JSON.stringify([])
    },
    {
      id: 'p4', category_id: 'cat-mez-small', name: 'מזוזה 10 ס"מ לחדרים',
      slug: 'mezuza-10cm', description: 'מזוזה קטנה לחדרים ושאר הפתחים. כשרה לכל המהדרין.',
      price: 120, stock: 80, is_featured: 0,
      variants: JSON.stringify([])
    },
    {
      id: 'p5', category_id: 'cat-tallit-gadol', name: 'טלית צמר ספרדית - מהודרת',
      slug: 'tallit-wool-sephardi', description: 'טלית גדול מצמר טהור 100%. ציציות ידניות. מגוון גדלים.',
      price: 450, original_price: 520, stock: 30, is_featured: 1,
      variants: JSON.stringify([{ name: 'גודל', options: ['50x180', '60x200', '70x200'] }, { name: 'צבע פס', options: ['שחור', 'כחול', 'לבן'] }])
    },
    {
      id: 'p6', category_id: 'cat-tallit-gadol', name: 'טלית משי לבן - חתן',
      slug: 'tallit-silk-chatan', description: 'טלית משי מפוארת לחתן. עיטורי כסף וזהב. מגיעה בשקית מהודרת.',
      price: 780, stock: 10, is_featured: 1,
      variants: JSON.stringify([{ name: 'גודל', options: ['60x200'] }])
    },
    {
      id: 'p7', category_id: 'cat-tallit-katan', name: 'טלית קטן צמר - לילדים',
      slug: 'tallit-katan-kids', description: 'טלית קטן מצמר לילדים. ציציות כשרות. נוח לכל היום.',
      price: 95, stock: 60, is_featured: 0,
      variants: JSON.stringify([{ name: 'גודל', options: ['4', '6', '8', '10', '12'] }])
    },
    {
      id: 'p8', category_id: 'cat-kippot', name: 'כיפה סרוגה - מגוון צבעים',
      slug: 'kippa-sruga', description: 'כיפות סרוגות בגדלים שונים. מגוון צבעים.',
      price: 25, stock: 200, is_featured: 0,
      variants: JSON.stringify([{ name: 'גודל', options: ['קטן', 'בינוני', 'גדול'] }, { name: 'צבע', options: ['שחור', 'לבן', 'כחול', 'חום'] }])
    },
    {
      id: 'p9', category_id: 'cat-kippot', name: 'כיפה קטיפה - שחורה',
      slug: 'kippa-velvet-black', description: 'כיפת קטיפה שחורה קלאסית.',
      price: 35, stock: 150, is_featured: 0,
      variants: JSON.stringify([{ name: 'גודל', options: ['קטן', 'בינוני', 'גדול'] }])
    },
    {
      id: 'p10', category_id: 'cat-books', name: 'סידור אשכנז - כיס',
      slug: 'siddur-ashkenaz-pocket', description: 'סידור תפילה לנוסח אשכנז. כריכה קשה. מתאים לנשיאה.',
      price: 55, stock: 40, is_featured: 0,
      variants: JSON.stringify([])
    },
  ];

  const insP = db.prepare(`INSERT INTO products (id, category_id, name, slug, description, price, original_price, stock, is_featured, variants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const p of products) {
    insP.run(p.id, p.category_id, p.name, p.slug, p.description, p.price, (p as any).original_price || null, p.stock, p.is_featured, p.variants);
  }
}
