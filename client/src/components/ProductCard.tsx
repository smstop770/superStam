import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import toast from 'react-hot-toast';

interface Props { product: Product; }

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZWNlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2VyaWYiIGZvbnQtc2l6ZT0iNTAiIGZpbGw9IiNjOWE4NGMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7kua88L3RleHQ+PC9zdmc+';

export default function ProductCard({ product }: Props) {
  const { addItem, openCart } = useCart();
  const image = product.images[0] || PLACEHOLDER;
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 0) {
      window.location.href = `/product/${product.slug}`;
      return;
    }
    addItem(product, 1, {});
    openCart();
    toast.success(`${product.name} נוסף לסל`);
  };

  return (
    <Link to={`/product/${product.slug}`} className="card group block">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
        {discount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {product.is_featured && (
          <span className="absolute top-2 left-2 bg-gold text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={10} fill="white" />מומלץ
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category_name}</p>
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 leading-snug">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-primary font-bold text-lg">₪{product.price.toLocaleString()}</span>
            {product.original_price && (
              <span className="text-gray-400 text-sm line-through mr-2">₪{product.original_price.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary-600 text-white p-2 rounded-lg transition-colors"
            title="הוסף לסל"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}
