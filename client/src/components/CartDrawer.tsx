import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, itemVariantKey } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag size={22} /> סל הקניות
          </h2>
          <button onClick={closeCart} className="p-1 hover:bg-primary-600 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg">הסל ריק</p>
              <p className="text-sm mt-2">הוסף מוצרים כדי להמשיך</p>
            </div>
          ) : (
            items.map((item) => {
              const vk = itemVariantKey(item.selectedVariants);
              const variantText = Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ');
              return (
                <div key={`${item.product.id}-${vk}`} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <img
                    src={item.product.images[0] || ''}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug line-clamp-2">{item.product.name}</p>
                    {variantText && <p className="text-xs text-gray-500 mt-0.5">{variantText}</p>}
                    <p className="text-primary font-bold mt-1">₪{item.product.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.product.id, vk, item.quantity - 1)}
                        className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product.id, vk, item.quantity + 1)}
                        className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus size={12} />
                      </button>
                      <span className="text-sm text-gray-500 mr-auto">
                        סה"כ: ₪{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                      <button onClick={() => removeItem(item.product.id, vk)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>סכום ביניים:</span>
              <span className="text-primary">₪{subtotal.toLocaleString()}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full text-center">
              המשך לתשלום
            </button>
          </div>
        )}
      </div>
    </>
  );
}
