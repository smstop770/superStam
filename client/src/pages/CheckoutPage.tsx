import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, getSettings } from '../api';
import type { SiteSettings } from '../types';
import { Truck, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, subtotal, clearCart, itemVariantKey } = useCart();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    customer_address: '', customer_city: '', notes: '',
  });

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
    if (items.length === 0) navigate('/');
  }, []);

  const shippingCost = parseFloat(settings.shipping_cost || '30');
  const freeShippingAbove = parseFloat(settings.free_shipping_above || '300');
  const shipping = subtotal >= freeShippingAbove ? 0 : shippingCost;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      toast.error('שם וטלפון הם שדות חובה');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        variant: item.selectedVariants,
      }));

      const result = await createOrder({ ...form, items: orderItems });
      clearCart();
      navigate('/order-success', { state: { orderId: result.orderId, total: result.total } });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'אירעה שגיאה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <h1 className="text-3xl font-bold text-primary mb-8">סיום הזמנה</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Lock size={20} className="text-primary" /> פרטי לקוח
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">שם מלא <span className="text-red-500">*</span></label>
                <input name="customer_name" value={form.customer_name} onChange={handleChange} className="input" placeholder="ישראל ישראלי" required />
              </div>
              <div>
                <label className="label">טלפון <span className="text-red-500">*</span></label>
                <input name="customer_phone" value={form.customer_phone} onChange={handleChange} className="input" placeholder="050-0000000" required />
              </div>
            </div>

            <div>
              <label className="label">אימייל (אופציונלי)</label>
              <input name="customer_email" type="email" value={form.customer_email} onChange={handleChange} className="input" placeholder="israel@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">כתובת</label>
                <input name="customer_address" value={form.customer_address} onChange={handleChange} className="input" placeholder="רחוב הרצל 1" />
              </div>
              <div>
                <label className="label">עיר</label>
                <input name="customer_city" value={form.customer_city} onChange={handleChange} className="input" placeholder="תל אביב" />
              </div>
            </div>

            <div>
              <label className="label">הערות להזמנה</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="input resize-none" rows={3} placeholder="בקשות מיוחדות, הנחיות משלוח..." />
            </div>

            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p>פרטיך מוצפנים ומאובטחים. ניצור איתך קשר לאישור ההזמנה.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
              {loading ? 'שולח...' : `אשר הזמנה - ₪${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-gray-800">סיכום הזמנה</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => {
                const vk = itemVariantKey(item.selectedVariants);
                const variantText = Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ');
                return (
                  <div key={`${item.product.id}-${vk}`} className="flex gap-2 text-sm">
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-1">{item.product.name}</p>
                      {variantText && <p className="text-gray-500 text-xs">{variantText}</p>}
                      <p className="text-gray-500">כמות: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary whitespace-nowrap">₪{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>סכום ביניים</span><span>₪{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1"><Truck size={14} /> משלוח</span>
                <span>{shipping === 0 ? <span className="text-green-600">חינם</span> : `₪${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">עוד ₪{(freeShippingAbove - subtotal).toLocaleString()} למשלוח חינם</p>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>סה"כ לתשלום</span>
                <span className="text-primary">₪{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
