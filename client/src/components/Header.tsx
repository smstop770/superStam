import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getCategories, getSettings } from '../api';
import type { Category, SiteSettings } from '../types';

export default function Header() {
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getSettings().then(setSettings).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const topCategories = categories.filter((c) => !c.parent_id);

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      {/* Top bar */}
      <div className="bg-primary-700 text-sm py-1 px-4 text-center text-gold-300">
        {settings.phone && (
          <span className="flex items-center justify-center gap-2">
            <Phone size={14} />
            <a href={`tel:${settings.phone}`} className="hover:text-gold">{settings.phone}</a>
            {parseFloat(settings.free_shipping_above || '300') > 0 && (
              <span className="mx-2">|</span>
            )}
            משלוח חינם בקנייה מעל ₪{settings.free_shipping_above || '300'}
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center leading-tight flex-shrink-0">
          <span className="text-gold text-2xl font-bold font-hebrew">סופר סת"ם</span>
          <span className="text-xs text-gray-300">ספרי תורה | תפילין | מזוזות</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {topCategories.map((cat) => (
            <div key={cat.id} className="relative" onMouseEnter={() => setOpenDropdown(cat.id)} onMouseLeave={() => setOpenDropdown(null)}>
              <Link
                to={`/category/${cat.slug}`}
                className="px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-semibold whitespace-nowrap"
              >
                {cat.name}
              </Link>
              {cat.children && cat.children.length > 0 && openDropdown === cat.id && (
                <div className="absolute top-full right-0 bg-white text-gray-800 rounded-xl shadow-2xl min-w-48 py-2 mt-1">
                  {cat.children.map((sub) => (
                    <Link key={sub.id} to={`/category/${sub.slug}`} className="block px-4 py-2 hover:bg-gray-50 hover:text-primary transition-colors">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש מוצרים..."
                className="border border-white/30 bg-primary-600 text-white placeholder-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold w-48"
              />
              <button type="button" onClick={() => setSearchOpen(false)}>
                <X size={20} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-primary-600 rounded-lg transition-colors">
              <Search size={20} />
            </button>
          )}

          {/* Cart */}
          <button onClick={openCart} className="p-2 hover:bg-primary-600 rounded-lg transition-colors relative">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -left-1 bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button className="lg:hidden p-2 hover:bg-primary-600 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-primary-700 border-t border-white/10 py-2 px-4">
          {topCategories.map((cat) => (
            <div key={cat.id}>
              <Link
                to={`/category/${cat.slug}`}
                className="block py-3 border-b border-white/10 font-semibold hover:text-gold"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
              {cat.children?.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/category/${sub.slug}`}
                  className="block py-2 pr-6 text-sm text-gray-300 hover:text-gold border-b border-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
