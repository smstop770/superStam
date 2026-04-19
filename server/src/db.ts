import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AdminUser, Setting, Category, Product } from './models';

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super-stam';
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected:', uri);
  await seedData();
}

async function seedData(): Promise<void> {
  // ── Admin user ────────────────────────────────────────────────
  const adminCount = await AdminUser.countDocuments();
  if (adminCount === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const password_hash = await bcrypt.hash(password, 10);
    await new AdminUser({ _id: uuidv4(), username, password_hash }).save();
    console.log(`👤 Admin created: ${username}`);
  }

  // ── Settings ──────────────────────────────────────────────────
  const settingsCount = await Setting.countDocuments();
  if (settingsCount === 0) {
    await Setting.insertMany([
      { _id: 'site_name',           value: 'סופר סת"ם' },
      { _id: 'site_subtitle',       value: 'ספרי תורה, תפילין ומזוזות באיכות הגבוהה ביותר' },
      { _id: 'phone',               value: '050-0000000' },
      { _id: 'email',               value: 'info@super-stam.co.il' },
      { _id: 'whatsapp',            value: '9720500000000' },
      { _id: 'free_shipping_above', value: '300' },
      { _id: 'shipping_cost',       value: '30' },
      { _id: 'order_webhook_url',   value: process.env.ORDER_WEBHOOK_URL || '' },
      { _id: 'voice_admin_phones',  value: '' },
    ]);
  }

  // ── Categories & Products ─────────────────────────────────────
  const catCount = await Category.countDocuments();
  if (catCount > 0) return;

  await Category.insertMany([
    { _id: 'cat-tefillin',     name: 'תפילין',        slug: 'tefillin',          description: 'תפילין מהודרים בהשגחה קפדנית', sort_order: 1 },
    { _id: 'cat-mezuzot',      name: 'מזוזות',        slug: 'mezuzot',           description: 'מזוזות כשרות לכל המהדרין',    sort_order: 2 },
    { _id: 'cat-tallitot',     name: 'טליתות',        slug: 'tallitot',          description: 'טליתות לכל גיל ועדה',          sort_order: 3 },
    { _id: 'cat-kippot',       name: 'כיפות',         slug: 'kippot',            description: 'כיפות מגוונות',               sort_order: 4 },
    { _id: 'cat-books',        name: 'ספרים',         slug: 'books',             description: 'סידורים, חומשים וספרי קודש',  sort_order: 5 },
    { _id: 'cat-tefillin-ash', name: 'תפילין אשכנז', slug: 'tefillin-ashkenaz', description: 'תפילין נוסח אשכנז', sort_order: 1, parent_id: 'cat-tefillin' },
    { _id: 'cat-tefillin-sep', name: 'תפילין ספרד',  slug: 'tefillin-sephardi', description: 'תפילין נוסח ספרד',  sort_order: 2, parent_id: 'cat-tefillin' },
    { _id: 'cat-mez-large',    name: 'מזוזות גדולות', slug: 'mezuzot-large',    description: 'מזוזות לפתח ראשי',  sort_order: 1, parent_id: 'cat-mezuzot' },
    { _id: 'cat-mez-small',    name: 'מזוזות קטנות',  slug: 'mezuzot-small',    description: 'מזוזות לחדרים',     sort_order: 2, parent_id: 'cat-mezuzot' },
    { _id: 'cat-tallit-gadol', name: 'טלית גדול',    slug: 'tallit-gadol',      description: 'טלית לגברים',      sort_order: 1, parent_id: 'cat-tallitot' },
    { _id: 'cat-tallit-katan', name: 'טלית קטן',     slug: 'tallit-katan',      description: 'ציצית לכל היום',   sort_order: 2, parent_id: 'cat-tallitot' },
  ]);

  await Product.insertMany([
    { _id: 'p1',  category_id: 'cat-tefillin-ash', name: 'תפילין גסות אשכנז - מהודר',   slug: 'tefillin-gasot-ashkenaz-mehudar', price: 1200, original_price: 1400, stock: 15,  is_featured: true,  variants: [{ name: 'סוג',  options: ['רש"י', 'ר"ת', 'שניהם'] }] },
    { _id: 'p2',  category_id: 'cat-tefillin-sep', name: 'תפילין דקות ספרד - כשר',      slug: 'tefillin-dakot-sephardi',         price: 850,                           stock: 20,  is_featured: true,  variants: [{ name: 'גודל', options: ['רגיל'] }] },
    { _id: 'p3',  category_id: 'cat-mez-large',    name: 'מזוזה גדולה 15 ס"מ - מהודר', slug: 'mezuza-large-15-mehudar',         price: 280,  original_price: 320,  stock: 50,  is_featured: true,  variants: [] },
    { _id: 'p4',  category_id: 'cat-mez-small',    name: 'מזוזה 10 ס"מ לחדרים',        slug: 'mezuza-10cm',                     price: 120,                           stock: 80,  is_featured: false, variants: [] },
    { _id: 'p5',  category_id: 'cat-tallit-gadol', name: 'טלית צמר ספרדית - מהודרת',   slug: 'tallit-wool-sephardi',            price: 450,  original_price: 520,  stock: 30,  is_featured: true,  variants: [{ name: 'גודל', options: ['50x180','60x200','70x200'] }, { name: 'צבע פס', options: ['שחור','כחול','לבן'] }] },
    { _id: 'p6',  category_id: 'cat-tallit-gadol', name: 'טלית משי לבן - חתן',         slug: 'tallit-silk-chatan',              price: 780,                           stock: 10,  is_featured: true,  variants: [{ name: 'גודל', options: ['60x200'] }] },
    { _id: 'p7',  category_id: 'cat-tallit-katan', name: 'טלית קטן צמר - לילדים',      slug: 'tallit-katan-kids',               price: 95,                            stock: 60,  is_featured: false, variants: [{ name: 'גודל', options: ['4','6','8','10','12'] }] },
    { _id: 'p8',  category_id: 'cat-kippot',       name: 'כיפה סרוגה - מגוון צבעים',   slug: 'kippa-sruga',                     price: 25,                            stock: 200, is_featured: false, variants: [{ name: 'גודל', options: ['קטן','בינוני','גדול'] }, { name: 'צבע', options: ['שחור','לבן','כחול','חום'] }] },
    { _id: 'p9',  category_id: 'cat-kippot',       name: 'כיפה קטיפה - שחורה',         slug: 'kippa-velvet-black',              price: 35,                            stock: 150, is_featured: false, variants: [{ name: 'גודל', options: ['קטן','בינוני','גדול'] }] },
    { _id: 'p10', category_id: 'cat-books',        name: 'סידור אשכנז - כיס',           slug: 'siddur-ashkenaz-pocket',          price: 55,                            stock: 40,  is_featured: false, variants: [] },
  ]);

  console.log('🌱 Seed data inserted');
}
