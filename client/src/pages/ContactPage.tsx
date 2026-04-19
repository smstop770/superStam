import { useState } from 'react';
import { Phone, Mail, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { getSettings } from '../api';
import { useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { getSettings().then(setSettings).catch(() => {}); }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) { toast.error('נא למלא שם והודעה'); return; }
    setSending(true);
    try {
      await api.post('/contact', form);
      setSent(true);
    } catch { toast.error('שגיאה בשליחה, נסה שוב'); }
    finally { setSending(false); }
  };

  if (sent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ההודעה נשלחה!</h2>
        <p className="text-gray-500 mb-6">נחזור אליך בהקדם האפשרי.</p>
        <button onClick={() => { setSent(false); setForm({ name: '', phone: '', email: '', message: '' }); }} className="btn-primary">
          שלח הודעה נוספת
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary text-center mb-2">צור קשר</h1>
      <p className="text-gray-500 text-center mb-10">נשמח לעזור בכל שאלה</p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact details */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">פרטי התקשרות</h2>
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone size={20} className="text-primary" />
              </div>
              <span className="text-lg font-medium" dir="ltr">{settings.phone}</span>
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail size={20} className="text-primary" />
              </div>
              <span className="text-lg font-medium">{settings.email}</span>
            </a>
          )}
          {settings.whatsapp && (
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-green-600" />
              </div>
              <span className="text-lg font-medium">וואטסאפ</span>
            </a>
          )}
          <p className="text-sm text-gray-400 mt-6 leading-relaxed">
            אנו מתמחים במכירת מוצרי סת"ם באיכות גבוהה — תפילין, מזוזות, ספרי תורה וטליתות.
            כל מוצר עובר בדיקה קפדנית ומגיע עם אישור כשרות.
          </p>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">שלח הודעה</h2>
          <div>
            <label className="label">שם מלא *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="ישראל ישראלי" required />
          </div>
          <div>
            <label className="label">טלפון</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="050-0000000" dir="ltr" />
          </div>
          <div>
            <label className="label">אימייל</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder="your@email.com" dir="ltr" />
          </div>
          <div>
            <label className="label">הודעה *</label>
            <textarea value={form.message} onChange={e => set('message', e.target.value)} className="input min-h-[120px] resize-none" placeholder="במה נוכל לעזור?" required />
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
            <Send size={18} />{sending ? 'שולח...' : 'שלח הודעה'}
          </button>
        </form>
      </div>
    </div>
  );
}
