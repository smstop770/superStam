import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState(query);

  useEffect(() => {
    setInputVal(query);
    if (!query) { setProducts([]); return; }
    setLoading(true);
    getProducts({ search: query, limit: 50 }).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) setSearchParams({ q: inputVal.trim() });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      <h1 className="text-3xl font-bold text-primary mb-6">חיפוש מוצרים</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-lg">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="חפש מוצר..."
          className="input flex-1"
        />
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Search size={18} />חפש
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : products.length === 0 && query ? (
        <div className="text-center py-16 text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-xl">לא נמצאו תוצאות עבור "{query}"</p>
        </div>
      ) : (
        <>
          {query && <p className="text-gray-600 mb-4">{products.length} תוצאות עבור "{query}"</p>}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
