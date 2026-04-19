import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Plus, Minus, Shield, Check } from 'lucide-react';
import { getProduct, getProducts } from '../api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZWNlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2VyaWYiIGZvbnQtc2l6ZT0iODAiIGZpbGw9IiNjOWE4NGMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7kua88L3RleHQ+PC9zdmc+';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addItem, openCart } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProduct(slug).then((p) => {
      setProduct(p);
      setActiveImage(0);
      const defaults: Record<string, string> = {};
      p.variants.forEach((v: any) => { defaults[v.name] = v.options[0]; });
      setSelectedVariants(defaults);
      getProducts({ category: p.category_id, limit: 5 }).then((prods: Product[]) =>
        setRelated(prods.filter((r) => r.id !== p.id).slice(0, 4))
      );
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-64 py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-xl text-gray-500">מוצר לא נמצא</p>
      <Link to="/" className="btn-primary mt-6 inline-block">חזרה לדף הבית</Link>
    </div>
  );

  const images = product.images.length > 0 ? product.images : [PLACEHOLDER];
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : null;

  const handleAddToCart = () => {
    const missing = product.variants.find((v) => !selectedVariants[v.name]);
    if (missing) { toast.error(`בחר ${missing.name}`); return; }
    addItem(product, quantity, selectedVariants);
    openCart();
    toast.success('המוצר נוסף לסל');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary">ראשי</Link>
        <ChevronLeft size={14} />
        {product.category_slug && (
          <>
            <Link to={`/category/${product.category_slug}`} className="hover:text-primary">{product.category_name}</Link>
            <ChevronLeft size={14} />
          </>
        )}
        <span className="text-primary font-semibold line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 shadow-md">
            <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.category_name}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">₪{product.price.toLocaleString()}</span>
            {product.original_price && (
              <>
                <span className="text-gray-400 text-lg line-through">₪{product.original_price.toLocaleString()}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">חסכון {discount}%</span>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants.map((variant) => (
            <div key={variant.name} className="mb-4">
              <p className="label">{variant.name}:</p>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                      selectedVariants[variant.name] === opt
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-6">
            <p className="label">כמות:</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button onClick={handleAddToCart} className="btn-primary w-full flex items-center justify-center gap-2 text-lg mb-4">
            <ShoppingCart size={22} />הוסף לסל
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
            {[
              { icon: <Shield size={18} />, text: 'כשרות מהודרת' },
              { icon: <Check size={18} />, text: 'בדיקה כפולה' },
              { icon: <Check size={18} />, text: 'איכות מובטחת' },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center text-xs text-gray-600 gap-1">
                <span className="text-gold">{b.icon}</span>{b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-10 p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-3 text-primary">תיאור המוצר</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary mb-6">מוצרים נוספים</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
