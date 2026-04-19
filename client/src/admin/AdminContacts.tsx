import { useEffect, useState } from 'react';
import { MessageCircle, Trash2, Send, Eye, CheckCheck, Phone, Mail } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  reply: string;
  replied_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:     { label: 'חדש',    color: 'bg-blue-100 text-blue-700' },
  read:    { label: 'נקרא',   color: 'bg-gray-100 text-gray-600' },
  replied: { label: 'נענה',   color: 'bg-green-100 text-green-700' },
};

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => api.get('/contact').then(r => setContacts(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const open = async (c: Contact) => {
    setActiveId(c.id);
    setReplyText(c.reply || '');
    if (c.status === 'new') {
      await api.put(`/contact/${c.id}/read`);
      setContacts(prev => prev.map(x => x.id === c.id ? { ...x, status: 'read' } : x));
    }
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) { toast.error('נא לכתוב תגובה'); return; }
    setSending(true);
    try {
      const r = await api.put(`/contact/${id}/reply`, { reply: replyText });
      setContacts(prev => prev.map(x => x.id === id ? r.data : x));
      toast.success('תגובה נשמרה');
    } catch { toast.error('שגיאה בשמירה'); }
    finally { setSending(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('למחוק פנייה זו?')) return;
    await api.delete(`/contact/${id}`);
    setContacts(prev => prev.filter(x => x.id !== id));
    if (activeId === id) setActiveId(null);
    toast.success('נמחק');
  };

  const active = contacts.find(c => c.id === activeId);
  const newCount = contacts.filter(c => c.status === 'new').length;

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="p-6 page-enter">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-primary" />
        פניות לקוחות
        {newCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{newCount} חדש</span>}
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          {contacts.length === 0 && <p className="text-gray-400 text-center py-10">אין פניות עדיין</p>}
          {contacts.map(c => (
            <div
              key={c.id}
              onClick={() => open(c)}
              className={`bg-white rounded-xl p-4 cursor-pointer border-2 transition-all ${activeId === c.id ? 'border-primary' : 'border-transparent hover:border-gray-200'} shadow-sm`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{c.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[c.status]?.color}`}>
                      {STATUS_LABELS[c.status]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{c.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString('he-IL')}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); remove(c.id); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {active ? (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 sticky top-4 self-start">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-800">{active.name}</h2>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_LABELS[active.status]?.color}`}>
                {STATUS_LABELS[active.status]?.label}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {active.phone && (
                <a href={`tel:${active.phone}`} className="flex items-center gap-2 hover:text-primary">
                  <Phone size={14} /> <span dir="ltr">{active.phone}</span>
                </a>
              )}
              {active.email && (
                <a href={`mailto:${active.email}`} className="flex items-center gap-2 hover:text-primary">
                  <Mail size={14} /> {active.email}
                </a>
              )}
              <p className="text-xs text-gray-400">{new Date(active.created_at).toLocaleString('he-IL')}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{active.message}</p>
            </div>

            {active.status === 'replied' && active.reply && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-1 text-green-700 font-semibold text-sm mb-2">
                  <CheckCheck size={14} /> תגובה שנשלחה
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{active.reply}</p>
              </div>
            )}

            <div>
              <label className="label">תגובה ללקוח</label>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="כתוב תגובה ללקוח..."
              />
              <p className="text-xs text-gray-400 mt-1">
                התגובה תישמר במערכת.
                {active.phone && <> לשלוח גם בוואטסאפ: <a href={`https://wa.me/972${active.phone.replace(/^0/, '')}?text=${encodeURIComponent(replyText)}`} target="_blank" rel="noreferrer" className="text-green-600 underline hover:text-green-700">לחץ כאן</a></>}
              </p>
              <button onClick={() => sendReply(active.id)} disabled={sending} className="btn-primary mt-3 flex items-center gap-2">
                <Send size={16} />{sending ? 'שומר...' : 'שמור תגובה'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Eye size={32} className="mx-auto mb-2 opacity-30" />
              <p>בחר פנייה לצפייה</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
