import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCategoriesFlat, getProducts,
  createCategory, updateCategory, deleteCategory,
} from '../api';
import type { Category, Product } from '../types';
import {
  Plus, Pencil, Trash2, X, ChevronDown, ChevronUp,
  FolderPlus, Tag, ListOrdered, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Category Form Modal ─────────────────────────────────────── */

const EMPTY_CAT = { name: '', slug: '', description: '', parent_id: '', sort_order: 0 };
const genSlug = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0590-\u05ff-]/g, '');

function CategoryFormModal({
  editing, topCats, defaultParentId, onClose, onSaved,
}: {
  editing: Category | null;
  topCats: Category[];
  defaultParentId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_CAT });

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name, slug: editing.slug, description: editing.description, parent_id: editing.parent_id || '', sort_order: editing.sort_order });
    } else {
      setForm({ ...EMPTY_CAT, parent_id: defaultParentId || '' });
    }
  }, [editing, defaultParentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, parent_id: form.parent_id || null };
    try {
      if (editing) await updateCategory(editing.id, data);
      else         await createCategory(data);
      toast.success(editing ? 'קטגוריה עודכנה' : 'קטגוריה נוצרה');
      onSaved();
    } catch (err: any) { toast.error(err.response?.data?.error || 'שגיאה'); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Tag size={20} className="text-primary" />
            {editing ? 'עריכת קטגוריה' : (form.parent_id ? 'תת-קטגוריה חדשה' : 'קטגוריה ראשית חדשה')}
          </h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">שם *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: p.slug || genSlug(e.target.value) }))}
              className="input" placeholder="שם הקטגוריה" required
            />
          </div>
          <div>
            <label className="label">סלאג (URL) *</label>
            <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: genSlug(e.target.value) }))} className="input" required />
          </div>
          <div>
            <label className="label">תיאור</label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input" placeholder="תיאור קצר (אופציונלי)" />
          </div>
          <div>
            <label className="label">קטגורית אב</label>
            <select value={form.parent_id} onChange={(e) => setForm((p) => ({ ...p, parent_id: e.target.value }))} className="input">
              <option value="">— קטגוריה ראשית —</option>
              {topCats.filter((c) => c.id !== editing?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">סדר תצוגה</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'עדכן' : 'צור'}</button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Sub-Category Card ─────────────────────────────────────────── */

function SubCategoryCard({
  sub, productCount, onManage, onEdit, onDelete,
}: {
  sub: Category;
  productCount: number;
  onManage: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-primary/30 hover:shadow-md transition-all p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 truncate">{sub.name}</p>
          {sub.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{sub.description}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0 mr-1">
          <button onClick={onEdit}   title="ערוך" className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"><Pencil  size={14} /></button>
          <button onClick={onDelete} title="מחק"  className="p-1.5 text-red-400  hover:bg-red-50  rounded-lg"><Trash2  size={14} /></button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
          {productCount} מוצרים
        </span>
        <button
          onClick={onManage}
          className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <ListOrdered size={14} />ניהול מוצרים
        </button>
      </div>
    </div>
  );
}

/* ─── Root Category Row ─────────────────────────────────────────── */

function RootCategoryRow({
  category, allCategories, allProducts, onEditCat, onDeleteCat, onAddSubCat,
}: {
  category: Category;
  allCategories: Category[];
  allProducts: Product[];
  onEditCat: (c: Category) => void;
  onDeleteCat: (c: Category) => void;
  onAddSubCat: (parentId: string) => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const subCategories = allCategories
    .filter((c) => c.parent_id === category.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const directCount = allProducts.filter((p) => p.category_id === category.id).length;
  const totalCount  = allProducts.filter((p) =>
    [category.id, ...subCategories.map((s) => s.id)].includes(p.category_id)
  ).length;

  const goToProducts = (catId: string) => navigate(`/admin/categories/${catId}/products`);

  const ICONS: Record<string, string> = {
    tefillin: '🎁', mezuzot: '📜', tallitot: '🕊️', kippot: '🔵', books: '📚',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${open ? 'border-primary/25' : 'border-transparent hover:border-gray-200'}`}>
      {/* ── Header row ── */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none hover:bg-gray-50/80 rounded-2xl"
        onClick={() => setOpen(!open)}
      >
        <span className="text-2xl w-10 text-center flex-shrink-0">{ICONS[category.slug] ?? '✡'}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-800">{category.name}</span>
            {subCategories.length > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                {subCategories.length} תת-קטגוריות
              </span>
            )}
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {totalCount} מוצרים סה"כ
            </span>
          </div>
          {category.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{category.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onEditCat(category)}   className="p-1.5 text-blue-500 hover:bg-blue-50  rounded-lg" title="ערוך"><Pencil size={16} /></button>
          <button onClick={() => onDeleteCat(category)} className="p-1.5 text-red-500  hover:bg-red-50   rounded-lg" title="מחק"><Trash2 size={16} /></button>
        </div>

        <div className="text-gray-400 flex-shrink-0">
          {open ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </div>
      </div>

      {/* ── Expanded body ── */}
      {open && (
        <div className="border-t px-5 pb-5 pt-4 space-y-5">

          {/* Direct products row */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-gray-700">מוצרים ישירים בקטגוריה "{category.name}"</span>
              <span className="text-xs text-gray-400 mr-2">({directCount} מוצרים)</span>
            </div>
            <button
              onClick={() => goToProducts(category.id)}
              className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              <ListOrdered size={15} />ניהול מוצרים
            </button>
          </div>

          {/* Sub-categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ArrowRight size={15} className="text-gray-400" />
                תת-קטגוריות
                {subCategories.length > 0 && (
                  <span className="text-xs text-gray-400 font-normal">({subCategories.length})</span>
                )}
              </span>
              <button
                onClick={() => onAddSubCat(category.id)}
                className="flex items-center gap-1.5 text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl font-semibold transition-colors border border-primary/20 hover:border-primary/40"
              >
                <FolderPlus size={15} />+ הוסף תת-קטגוריה
              </button>
            </div>

            {subCategories.length === 0 ? (
              <div className="text-center py-6 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-sm">אין תת-קטגוריות</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {subCategories.map((sub) => (
                  <SubCategoryCard
                    key={sub.id}
                    sub={sub}
                    productCount={allProducts.filter((p) => p.category_id === sub.id).length}
                    onManage={() => goToProducts(sub.id)}
                    onEdit={() => onEditCat(sub)}
                    onDelete={() => onDeleteCat(sub)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [catModal,   setCatModal]   = useState<{
    open: boolean; editing?: Category | null; defaultParentId?: string;
  }>({ open: false });

  const load = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([getCategoriesFlat(), getProducts({ limit: 500 })]);
      setCategories(cats);
      setProducts(prods);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteCat = async (cat: Category) => {
    if (!confirm(`למחוק "${cat.name}"? כל המוצרים שבה יימחקו!`)) return;
    try { await deleteCategory(cat.id); toast.success('נמחק'); load(); }
    catch { toast.error('שגיאה'); }
  };

  const topCategories = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="p-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">קטגוריות</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            פתח קטגוריה → לחץ "ניהול מוצרים" לעריכת המוצרים בדף נפרד
          </p>
        </div>
        <button
          onClick={() => setCatModal({ open: true, editing: null })}
          className="btn-primary flex items-center gap-2"
        >
          <FolderPlus size={18} />קטגוריה ראשית חדשה
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      ) : topCategories.length === 0 ? (
        <div className="text-center py-20 text-gray-300 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <Tag size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg text-gray-400">אין קטגוריות עדיין</p>
          <button onClick={() => setCatModal({ open: true })} className="btn-primary mt-4">
            צור קטגוריה ראשונה
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topCategories.map((cat) => (
            <RootCategoryRow
              key={cat.id}
              category={cat}
              allCategories={categories}
              allProducts={products}
              onEditCat={(c) => setCatModal({ open: true, editing: c })}
              onDeleteCat={handleDeleteCat}
              onAddSubCat={(parentId) => setCatModal({ open: true, editing: null, defaultParentId: parentId })}
            />
          ))}
        </div>
      )}

      {catModal.open && (
        <CategoryFormModal
          editing={catModal.editing ?? null}
          topCats={topCategories}
          defaultParentId={catModal.defaultParentId}
          onClose={() => setCatModal({ open: false })}
          onSaved={() => { setCatModal({ open: false }); load(); }}
        />
      )}
    </div>
  );
}
