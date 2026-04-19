import { useEffect, useState } from 'react';
import { getOrders, getProducts, getCategories } from '../api';
import { ShoppingBag, Package, Tag, TrendingUp } from 'lucide-react';
import type { Order } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין', processing: 'בטיפול', shipped: 'נשלח', completed: 'הושלם', cancelled: 'בוטל',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, categories: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([getOrders({ limit: 5 }), getProducts({ limit: 1000 }), getCategories()]).then(([orders, products, categories]) => {
      const revenue = orders.reduce((s: number, o: Order) => s + o.total, 0);
      setStats({ orders: orders.length, products: products.length, categories: categories.length, revenue });
      setRecentOrders(orders.slice(0, 5));
    }).catch(console.error);
  }, []);

  return (
    <div className="p-6 page-enter">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">לוח בקרה</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'הזמנות', value: stats.orders, icon: <ShoppingBag size={24} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'מוצרים', value: stats.products, icon: <Package size={24} />, color: 'text-green-600 bg-green-50' },
          { label: 'קטגוריות', value: stats.categories, icon: <Tag size={24} />, color: 'text-purple-600 bg-purple-50' },
          { label: 'הכנסות', value: `₪${stats.revenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'text-gold-600 bg-yellow-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">הזמנות אחרונות</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">אין הזמנות עדיין</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-3 text-right font-medium">#</th>
                  <th className="pb-3 text-right font-medium">לקוח</th>
                  <th className="pb-3 text-right font-medium">טלפון</th>
                  <th className="pb-3 text-right font-medium">סה"כ</th>
                  <th className="pb-3 text-right font-medium">סטטוס</th>
                  <th className="pb-3 text-right font-medium">תאריך</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 font-semibold">{order.customer_name}</td>
                    <td className="py-3">{order.customer_phone}</td>
                    <td className="py-3 font-bold text-primary">₪{order.total.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('he-IL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
