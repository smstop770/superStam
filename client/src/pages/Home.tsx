import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, getSettings } from '../api';
import type { Product, Category, SiteSettings } from '../types';
import ProductCard from '../components/ProductCard';
import { Shield, Award, Truck, HeadphonesIcon } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  tefillin: '🎁', mezuzot: '📜', tallitot: '🕊️', kippot: '🔵', books: '📚',
};

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    getProducts({ featured: '1', limit: 8 }).then(setFeatured).catch(() => {});
    getCategories().then((cats) => setCategories(cats.filter((c: Category) => !c.parent_id))).catch(() => {});
    getSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 text-9xl font-bold opacity-20">סופר</div>
          <div className="absolute bottom-10 left-20 text-9xl font-bold opacity-20">סת"ם</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-block bg-gold/20 text-gold-300 px-4 py-1 rounded-full text-sm font-semibold mb-4 border border-gold/30">
            כשרות מהדרין ✦ איכות מובטחת
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-hebrew">
            סופר סת"ם
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-2">ספרי תורה · תפילין · מזוזות</p>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            {settings.site_subtitle || 'מוצרי יודאיקה ומצוות באיכות הגבוהה ביותר, בכשרות מהודרת'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/category/tefillin" className="btn-gold text-lg px-8">
              לחנות
            </Link>
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="btn-outline border-white text-white hover:bg-white hover:text-primary text-lg px-8">
                צור קשר
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gold/10 border-y border-gold/20">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Shield size={28} className="text-primary mx-auto mb-2" />, title: 'כשרות מובטחת', desc: 'בדיקה כפולה לכל מוצר' },
            { icon: <Award size={28} className="text-primary mx-auto mb-2" />, title: 'איכות גבוהה', desc: 'חומרי גלם מובחרים' },
            { icon: <Truck size={28} className="text-primary mx-auto mb-2" />, title: 'משלוח מהיר', desc: `חינם מעל ₪${settings.free_shipping_above || '300'}` },
            { icon: <HeadphonesIcon size={28} className="text-primary mx-auto mb-2" />, title: 'שירות אישי', desc: 'ייעוץ מקצועי תמיד' },
          ].map((b, i) => (
            <div key={i} className="py-2">
              {b.icon}
              <p className="font-bold text-gray-800">{b.title}</p>
              <p className="text-sm text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">קטגוריות</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="card p-6 text-center hover:border-2 hover:border-gold/50 group"
            >
              <div className="text-4xl mb-3">{CATEGORY_ICONS[cat.slug] || '✡'}</div>
              <h3 className="font-bold text-gray-800 group-hover:text-primary">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary">מוצרים מומלצים</h2>
            <Link to="/search" className="text-primary hover:text-gold font-semibold transition-colors">
              כל המוצרים ←
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary text-white py-14 text-center px-4">
        <h2 className="text-3xl font-bold mb-3">יש לכם שאלות?</h2>
        <p className="text-gray-300 mb-6">אנחנו כאן לעזור בכל שאלה בנושא כשרות, מידות ובחירת המוצר הנכון</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="btn-gold">
              התקשרו: {settings.phone}
            </a>
          )}
          {settings.whatsapp && (
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              שלחו וואטסאפ
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
