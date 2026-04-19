import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      authLogin(data.token, data.username);
      navigate('/admin');
    } catch {
      toast.error('שם משתמש או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-primary p-3 rounded-full">
              <Lock size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary">פאנל ניהול</h1>
          <p className="text-gray-500 text-sm mt-1">סופר סת"ם</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">שם משתמש</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="label">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  );
}
