import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tag, Package, ShoppingBag, Settings, LogOut, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'לוח בקרה', icon: <LayoutDashboard size={20} />, end: true },
  { to: '/admin/categories', label: 'קטגוריות', icon: <Tag size={20} /> },
  { to: '/admin/products', label: 'מוצרים', icon: <Package size={20} /> },
  { to: '/admin/orders', label: 'הזמנות', icon: <ShoppingBag size={20} /> },
  { to: '/admin/settings', label: 'הגדרות', icon: <Settings size={20} /> },
];

export default function AdminLayout() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-gold">סופר סת"ם</h1>
          <p className="text-xs text-gray-300 mt-1">פאנל ניהול</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-white/20 text-white font-semibold' : 'hover:bg-white/10 text-gray-200'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 text-gray-300 text-sm">
            <ExternalLink size={16} />פתח חנות
          </a>
          <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-300">
            <span>{username}</span>
            <button onClick={handleLogout} className="hover:text-red-400 transition-colors" title="יציאה">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
