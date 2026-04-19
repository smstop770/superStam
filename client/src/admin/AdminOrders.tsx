import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../api';
import type { Order } from '../types';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין', processing: 'בטיפול', shipped: 'נשלח', completed: 'הושלם', cancelled: 'בוטל',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    getOrders({ limit: 100, ...(statusFilter ? { status: statusFilter } : {}) })
      .then(setOrders).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    try { await updateOrderStatus(id, status); toast.success('סטטוס עודכן'); load(); } catch { toast.error('שגיאה'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק הזמנה זו?')) return;
    try { await deleteOrder(id); toast.success('נמחק'); load(); } catch { toast.error('שגיאה'); }
  };

  return (
    <div className="p-6 page-enter">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-800">הזמנות</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-48">
          <option value="">כל הסטטוסים</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div> : (
        <div className="space-y-3">
          {orders.length === 0 && <div className="text-center py-16 text-gray-400 bg-white rounded-xl"><p className="text-xl">אין הזמנות</p></div>}
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                <span className="font-mono text-xs text-gray-400 w-24 flex-shrink-0">{order.id.slice(0, 8).toUpperCase()}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.customer_phone}</p>
                </div>
                <p className="font-bold text-primary">₪{order.total.toLocaleString()}</p>
                <select
                  value={order.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('he-IL')}</p>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                {expandedId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {/* Expanded details */}
              {expandedId === order.id && (
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-700">פרטי לקוח</h3>
                      <p className="text-sm text-gray-600">שם: {order.customer_name}</p>
                      <p className="text-sm text-gray-600">טלפון: {order.customer_phone}</p>
                      {order.customer_email && <p className="text-sm text-gray-600">אימייל: {order.customer_email}</p>}
                      {order.customer_address && <p className="text-sm text-gray-600">כתובת: {order.customer_address} {order.customer_city}</p>}
                      {order.notes && <p className="text-sm text-gray-600 mt-1">הערות: {order.notes}</p>}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-700">פריטים</h3>
                      {order.items.map((item, i) => (
                        <div key={i} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.name} × {item.quantity} {Object.entries(item.variant || {}).map(([k, v]) => `(${k}: ${v})`).join(' ')}</span>
                          <span className="font-semibold">₪{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t mt-2 pt-2 text-sm">
                        <div className="flex justify-between"><span>משלוח</span><span>₪{order.shipping}</span></div>
                        <div className="flex justify-between font-bold text-primary"><span>סה"כ</span><span>₪{order.total.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
