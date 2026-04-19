import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSettings, getCategories } from '../api';
import type { SiteSettings, Category } from '../types';

export default function Footer() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
    getCategories().then((cats) => setCategories(cats.filter((c: Category) => !c.parent_id))).catch(() => {});
  }, []);

  return (
    <footer className="bg-primary-700 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h3 className="text-gold text-xl font-bold mb-3">סופר סת"ם</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {settings.site_subtitle || 'ספרי תורה, תפילין ומזוזות באיכות הגבוהה ביותר'}
          </p>
          <div className="mt-4 space-y-2">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-sm text-gray-300 hover:text-gold transition-colors">
                <Phone size={16} />{settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-sm text-gray-300 hover:text-gold transition-colors">
                <Mail size={16} />{settings.email}
              </a>
            )}
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-gold transition-colors">
                <MessageCircle size={16} />וואטסאפ
              </a>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-gold text-lg font-semibold mb-3">קטגוריות</h3>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.slug}`} className="text-sm text-gray-300 hover:text-gold transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h3 className="text-gold text-lg font-semibold mb-3">מידע</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>כל המוצרים בהשגחה קפדנית</li>
            <li>משלוח לכל הארץ</li>
            <li>
              {parseFloat(settings.free_shipping_above || '300') > 0
                ? `משלוח חינם מעל ₪${settings.free_shipping_above}`
                : 'משלוח חינם'}
            </li>
            <li>תעודות כשרות לכל המוצרים</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} סופר סת"ם. כל הזכויות שמורות.
      </div>
    </footer>
  );
}
