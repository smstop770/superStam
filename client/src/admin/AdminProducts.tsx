import { useEffect, useState, useCallback } from 'react';
import { getProducts, getCategoriesFlat, deleteProduct } from '../api';
import type { Product, Category } from '../types';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductModal from './components/ProductModal';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState<{ open: boolean; product?: Product | null }>({ open: false });

  const load = useCallback(() => {
    Promise.all([getProducts({ limit: 200 }), getCategoriesFlat()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p: Product) => {
    if (!confirm(`למחוק "${p.name}"?`)) return;
    try { await deleteProduct(p.id); toast.success('נמחק'); load(); } catch { toast.error('שגיאה'); }
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.includes(search) || p.slug.includes(search);
    const matchCat = !filterCat || p.category_id === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 page-enter">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">כל המוצרים</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} מוצרים סה"כ</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש..." className="input pr-9 w-48" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input w-44">
            <option value="">כל הקטגוריות</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.parent_id ? '└ ' : ''}{c.name}</option>)}
          </select>
          <button onClick={() => setModal({ open: true, product: null })} className="btn-primary flex items-center gap-2">
            <Plus size={18} />מוצר חדש
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">תמונה</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">שם</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">קטגוריה</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">מחיר</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">מלאי</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">אפשרויות</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">סטטוס</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">לא נמצאו מוצרים</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {p.images[0]
                        ? <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg" />
                        : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg">📦</div>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold max-w-52 truncate">{p.name}</p>
                      {p.is_featured && <span className="text-xs text-gold">⭐ מומלץ</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.category_name}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-primary">₪{p.price.toLocaleString()}</p>
                      {p.original_price && <p className="text-xs text-gray-400 line-through">₪{p.original_price.toLocaleString()}</p>}
                    </td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      {p.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.variants.map((v) => (
                            <span key={v.name} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {v.name} ({v.options.length})
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.is_active ? 'פעיל' : 'מוסתר'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setModal({ open: true, product: p })} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && (
        <ProductModal
          product={modal.product ?? null}
          categories={categories}
          onClose={() => setModal({ open: false })}
          onSaved={() => { setModal({ open: false }); load(); }}
        />
      )}
    </div>
  );
}
