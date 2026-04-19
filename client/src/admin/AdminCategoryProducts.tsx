import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategory, getProducts, deleteProduct, getCategoriesFlat } from '../api';
import type { Product, Category } from '../types';
import { ArrowLeft, Plus, Pencil, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductModal from './components/ProductModal';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23f3f4f6"/></svg>';

export default function AdminCategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [category, setCategory]   = useState<Category | null>(null);
  const [products, setProducts]   = useState<Product[]>([]);
  const [allCats,  setAllCats]    = useState<Category[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [modal,    setModal]      = useState<{ open: boolean; product?: Product | null }>({ open: false });

  const load = useCallback(async () => {
    if (!categoryId) return;
    try {
      const [cat, prods, cats] = await Promise.all([
        getCategory(categoryId),
        getProducts({ category: categoryId, limit: 500 }),
        getCategoriesFlat(),
      ]);
      setCategory(cat);
      setProducts(prods);
      setAllCats(cats);
    } catch { toast.error('שגיאה בטעינת הנתונים'); }
    finally { setLoading(false); }
  }, [categoryId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p: Product) => {
    if (!confirm(`למחוק "${p.name}"?`)) return;
    try { await deleteProduct(p.id); toast.success('מוצר נמחק'); load(); }
    catch { toast.error('שגיאה'); }
  };

  /* parent category name for breadcrumb */
  const parentCat = category?.parent_id ? allCats.find((c) => c.id === category.parent_id) : null;

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="p-6 page-enter">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => navigate('/admin/categories')}
          className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-2 rounded-xl font-semibold transition-colors"
        >
          <ArrowLeft size={18} />
          חזרה לקטגוריות
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>/</span>
          {parentCat && (
            <>
              <button
                onClick={() => navigate(`/admin/categories/${parentCat.id}/products`)}
                className="hover:text-primary transition-colors"
              >
                {parentCat.name}
              </button>
              <span>/</span>
            </>
          )}
          <span className="text-gray-700 font-semibold">{category?.name}</span>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex items-center justify-between gap-4 flex-wrap border-2 border-primary/10">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">מנהל קטגוריה</p>
          <h1 className="text-2xl font-bold text-gray-800">{category?.name}</h1>
          {category?.description && (
            <p className="text-sm text-gray-400 mt-1">{category.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-semibold text-gray-700">{products.length}</span> מוצרים בקטגוריה זו
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, product: null })}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />הוסף מוצר
        </button>
      </div>

      {/* ── Products grid ── */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-300 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <Package size={56} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl text-gray-400 font-semibold">אין מוצרים בקטגוריה זו</p>
          <p className="text-sm text-gray-300 mt-1">לחץ על הכפתור כדי להוסיף מוצר ראשון</p>
          <button onClick={() => setModal({ open: true })} className="btn-primary mt-5">
            <Plus size={16} className="inline ml-1" />הוסף מוצר ראשון
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-xl border-2 hover:shadow-lg hover:border-primary/30 transition-all group ${
                !p.is_active ? 'opacity-55 border-red-100' : 'border-gray-100'
              }`}
            >
              {/* Image */}
              <div className="aspect-square rounded-t-xl overflow-hidden bg-gray-50 relative">
                <img
                  src={p.images[0] || PLACEHOLDER}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                />
                {p.is_featured && (
                  <span className="absolute top-1.5 right-1.5 bg-gold text-white text-xs px-1.5 py-0.5 rounded-full font-bold">⭐</span>
                )}
                {!p.is_active && (
                  <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">מוסתר</span>
                )}
                {/* Hover actions overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setModal({ open: true, product: p })}
                    className="bg-white text-blue-600 p-2 rounded-xl hover:bg-blue-50 shadow"
                    title="ערוך"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="bg-white text-red-600 p-2 rounded-xl hover:bg-red-50 shadow"
                    title="מחק"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1.5">{p.name}</p>

                {/* Variants */}
                {p.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.variants.map((v) => (
                      <span key={v.name} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {v.name}: {v.options.slice(0, 3).join(', ')}{v.options.length > 3 ? '...' : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-primary font-bold">₪{p.price.toLocaleString()}</span>
                    {p.original_price && (
                      <span className="text-xs text-gray-400 line-through mr-1">₪{p.original_price.toLocaleString()}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">מלאי: {p.stock}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button
            onClick={() => setModal({ open: true })}
            className="aspect-square min-h-40 rounded-xl border-2 border-dashed border-primary/30 text-primary/40 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
          >
            <Plus size={32} />
            <span className="text-sm font-semibold">הוסף מוצר</span>
          </button>
        </div>
      )}

      {/* Product modal */}
      {modal.open && (
        <ProductModal
          product={modal.product ?? null}
          categories={allCats}
          defaultCategoryId={categoryId}
          onClose={() => setModal({ open: false })}
          onSaved={() => { setModal({ open: false }); load(); }}
        />
      )}
    </div>
  );
}
