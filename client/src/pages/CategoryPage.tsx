import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getProducts, getCategory, getCategories } from '../api';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      getCategory(slug),
      getProducts({ category: slug, limit: 50 }),
      getCategories(),
    ]).then(([cat, prods, allCats]) => {
      setCategory(cat);
      setProducts(prods);
      setSubCategories(allCats.flatMap((c: Category) => c.children || []).filter((c: Category) => c.parent_id === cat.id));
    }).catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-64 py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (!category) return (
    <div className="text-center py-20">
      <p className="text-xl text-gray-500">קטגוריה לא נמצאה</p>
      <Link to="/" className="btn-primary mt-6 inline-block">חזרה לדף הבית</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary">ראשי</Link>
        <ChevronLeft size={14} />
        <span className="text-primary font-semibold">{category.name}</span>
      </nav>

      {/* Category header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">{category.name}</h1>
        {category.description && <p className="text-gray-600 mt-2">{category.description}</p>}
      </div>

      {/* Sub-categories */}
      {subCategories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to={`/category/${slug}`} className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold">
            הכל
          </Link>
          {subCategories.map((sub) => (
            <Link key={sub.id} to={`/category/${sub.slug}`} className="px-4 py-2 rounded-full border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products */}
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl">אין מוצרים בקטגוריה זו כרגע</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
