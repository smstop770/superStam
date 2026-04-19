import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage() {
  const location = useLocation();
  const { orderId, total } = (location.state as any) || {};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle size={80} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">ההזמנה התקבלה!</h1>
        <p className="text-gray-600 mb-2">תודה על הזמנתך. ניצור איתך קשר בקרוב לאישור ותיאום המשלוח.</p>
        {orderId && (
          <p className="text-sm text-gray-400 mb-2">מספר הזמנה: <span className="font-mono font-semibold">{orderId.slice(0, 8).toUpperCase()}</span></p>
        )}
        {total && (
          <p className="text-lg font-bold text-primary mb-6">סכום ההזמנה: ₪{parseFloat(total).toLocaleString()}</p>
        )}
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={18} />דף הבית
          </Link>
          <Link to="/search" className="btn-outline flex items-center gap-2">
            <ShoppingBag size={18} />המשך קנייה
          </Link>
        </div>
      </div>
    </div>
  );
}
