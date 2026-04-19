import { useEffect, useState } from 'react';
import { getAllSettings, updateSettings, changePassword } from '../api';
import toast from 'react-hot-toast';
import { Save, Lock } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => { getAllSettings().then(setSettings).finally(() => setLoading(false)); }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await updateSettings(settings); toast.success('הגדרות נשמרו'); } catch { toast.error('שגיאה'); } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('הסיסמאות אינן תואמות'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('סיסמה חייבת להכיל לפחות 6 תווים'); return; }
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success('סיסמה שונתה');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch { toast.error('סיסמה נוכחית שגויה'); }
  };

  const set = (key: string, value: string) => setSettings((p) => ({ ...p, [key]: value }));

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>;

  return (
    <div className="p-6 page-enter max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">הגדרות</h1>

      {/* Site settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">הגדרות אתר</h2>
        <div>
          <label className="label">שם האתר</label>
          <input value={settings.site_name || ''} onChange={(e) => set('site_name', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">כותרת משנה</label>
          <input value={settings.site_subtitle || ''} onChange={(e) => set('site_subtitle', e.target.value)} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">טלפון</label>
            <input value={settings.phone || ''} onChange={(e) => set('phone', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">אימייל</label>
            <input value={settings.email || ''} onChange={(e) => set('email', e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="label">וואטסאפ (מספר בינלאומי ללא +)</label>
          <input value={settings.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} className="input" placeholder="9720500000000" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">משלוח חינם מעל ₪</label>
            <input type="number" value={settings.free_shipping_above || ''} onChange={(e) => set('free_shipping_above', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">עלות משלוח ₪</label>
            <input type="number" value={settings.shipping_cost || ''} onChange={(e) => set('shipping_cost', e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Webhook URL להזמנות (API חיצוני)</label>
          <input value={settings.order_webhook_url || ''} onChange={(e) => set('order_webhook_url', e.target.value)} className="input" placeholder="https://your-api.com/orders" />
          <p className="text-xs text-gray-400 mt-1">כל הזמנה חדשה תישלח לכתובת זו כ-POST request</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={18} />{saving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Lock size={20} className="text-primary" />שינוי סיסמה
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">סיסמה נוכחית</label>
            <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="label">סיסמה חדשה</label>
            <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="label">אשר סיסמה חדשה</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} className="input" required />
          </div>
          <button type="submit" className="btn-outline flex items-center gap-2">
            <Lock size={18} />שנה סיסמה
          </button>
        </form>
      </div>
    </div>
  );
}
