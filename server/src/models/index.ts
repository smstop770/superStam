import mongoose, { Schema } from 'mongoose';

function jsonTransform(_doc: any, ret: any) {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
}
const opts = {
  toJSON: { transform: jsonTransform },
  toObject: { transform: jsonTransform },
};

// ── Category ──────────────────────────────────────────────────
const categorySchema = new Schema({
  _id:         { type: String, required: true },
  name:        { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  parent_id:   { type: String, default: null },
  sort_order:  { type: Number, default: 0 },
  created_at:  { type: Date,   default: Date.now },
}, opts);
export const Category = mongoose.model('Category', categorySchema);

// ── Product ───────────────────────────────────────────────────
const productSchema = new Schema({
  _id:            { type: String, required: true },
  category_id:    { type: String, required: true },
  name:           { type: String, required: true },
  slug:           { type: String, required: true, unique: true },
  description:    { type: String, default: '' },
  price:          { type: Number, required: true },
  original_price: { type: Number, default: null },
  images:         { type: [String], default: [] },
  stock:          { type: Number, default: 0 },
  variants:       { type: Schema.Types.Mixed, default: [] },
  is_featured:    { type: Boolean, default: false },
  is_active:      { type: Boolean, default: true },
  sort_order:     { type: Number, default: 0 },
  created_at:     { type: Date, default: Date.now },
}, opts);
export const Product = mongoose.model('Product', productSchema);

// ── Order ─────────────────────────────────────────────────────
const orderSchema = new Schema({
  _id:              { type: String, required: true },
  customer_name:    { type: String, required: true },
  customer_phone:   { type: String, required: true },
  customer_email:   { type: String, default: '' },
  customer_address: { type: String, default: '' },
  customer_city:    { type: String, default: '' },
  items:            { type: Schema.Types.Mixed, default: [] },
  subtotal:         { type: Number, required: true },
  shipping:         { type: Number, default: 0 },
  total:            { type: Number, required: true },
  notes:            { type: String, default: '' },
  status:           { type: String, default: 'pending' },
  webhook_sent:     { type: Boolean, default: false },
  created_at:       { type: Date, default: Date.now },
}, opts);
export const Order = mongoose.model('Order', orderSchema);

// ── AdminUser ─────────────────────────────────────────────────
const adminUserSchema = new Schema({
  _id:           { type: String, required: true },
  username:      { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at:    { type: Date, default: Date.now },
}, opts);
export const AdminUser = mongoose.model('AdminUser', adminUserSchema);

// ── Setting ───────────────────────────────────────────────────
// _id IS the key (e.g. 'site_name')
const settingSchema = new Schema({
  _id:   { type: String, required: true },
  value: { type: String, default: '' },
}, opts);
export const Setting = mongoose.model('Setting', settingSchema);
