import { useState, useEffect } from 'react';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import { createProduct, updateProduct, uploadImage } from '../../api';
import type { Product, Category } from '../../types';
import VariantEditor, { type VariantRow } from './VariantEditor';
import toast from 'react-hot-toast';

interface Props {
  product?: Product | null;
  categories: Category[];
  defaultCategoryId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY = {
  category_id: '', name: '', slug: '', description: '',
  price: '', original_price: '', images: [] as string[],
  stock: '100', is_featured: false, is_active: true, sort_order: 0,
};

function genSlug(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0590-\u05ff-]/g, '');
}

export default function ProductModal({ product, categories, defaultCategoryId, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        category_id: product.category_id, name: product.name, slug: product.slug,
        description: product.description, price: String(product.price),
        original_price: product.original_price ? String(product.original_price) : '',
        images: product.images, stock: String(product.stock),
        is_featured: product.is_featured, is_active: product.is_active, sort_order: product.sort_order,
      });
      setVariants(product.variants.map((v) => ({ name: v.name, options: [...v.options] })));
    } else {
      setForm({ ...EMPTY, category_id: defaultCategoryId || categories[0]?.id || '' });
      setVariants([]);
    }
  }, [product, defaultCategoryId]);

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      set('images', [...form.images, url]);
      toast.success('תמונה הועלתה');
    } catch { toast.error('שגיאה בהעלאת תמונה'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) { toast.error('בחר קטגוריה'); return; }
    if (!form.name.trim())  { toast.error('שם מוצר חובה'); return; }
    if (!form.price)        { toast.error('מחיר חובה'); return; }

    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock) || 0,
        variants: variants.filter((v) => v.name && v.options.length > 0),
      };
      if (product) await updateProduct(product.id, data);
      else         await createProduct(data);
      toast.success(product ? 'מוצר עודכן' : 'מוצר נוצר');
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'שגיאה');
    } finally { setSaving(false); }
  };

  const flatCategories = categories.reduce<Category[]>((acc, cat) => {
    acc.push(cat);
    if (cat.children) acc.push(...cat.children);
    return acc;
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-primary text-white rounded-t-2xl">
          <h2 className="text-lg font-bold">{product ? `עריכה: ${product.name}` : 'מוצר חדש'}</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg"><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">שם המוצר *</label>
              <input
                value={form.name}
                onChange={(e) => { set('name', e.target.value); if (!product) set('slug', genSlug(e.target.value)); }}
                className="input" placeholder='למשל: תפילין גסות אשכנז מהודר' required
              />
            </div>
            <div>
              <label className="label">קטגוריה *</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="input" required>
                <option value="">-- בחר --</option>
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.parent_id ? '└ ' : ''}{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">סלאג (URL)</label>
              <input value={form.slug} onChange={(e) => set('slug', e.target.value)} className="input text-sm" required />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">תיאור המוצר</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="input resize-none" rows={3} placeholder="תיאור מפורט של המוצר, כשרות, מידות וכו'" />
          </div>

          {/* Pricing & stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">מחיר ₪ *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} className="input" placeholder="0" required />
            </div>
            <div>
              <label className="label">מחיר מקורי ₪</label>
              <input type="number" step="0.01" min="0" value={form.original_price} onChange={(e) => set('original_price', e.target.value)} className="input" placeholder="לפני הנחה" />
            </div>
            <div>
              <label className="label">מלאי</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="input" />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="label">תמונות</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" />
                  <button
                    type="button"
                    onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                </div>
              ))}
              <label className={`w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                {uploading ? <Loader2 size={20} className="text-gray-400 animate-spin" /> : <ImagePlus size={20} className="text-gray-400" />}
                <span className="text-xs text-gray-400 mt-1">העלה</span>
              </label>
            </div>
            <input
              value={form.images.join('\n')}
              onChange={(e) => set('images', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
              placeholder="או הכנס כתובות URL, שורה לכל תמונה"
              className="input text-xs"
            />
          </div>

          {/* Variants */}
          <div>
            <label className="label mb-2 block">גדלים / סוגים / אפשרויות</label>
            <VariantEditor variants={variants} onChange={setVariants} />
          </div>

          {/* Flags */}
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">מוצר מומלץ ⭐</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">פעיל (מוצג בחנות)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {product ? 'שמור שינויים' : 'צור מוצר'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
}
