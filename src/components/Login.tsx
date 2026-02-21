import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Lock, User, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-[40px] border border-slate-800 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/30">
              <Lock className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ImmoRIM</h1>
            <p className="text-slate-400 font-medium">إدارة العقارات / Gestion Immobilière</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">{t('common.username')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">{t('common.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-error text-sm font-bold text-center bg-error/10 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              {loading ? t('common.loading') : (
                <>
                  Connexion
                  <ArrowRight size={20} className={cn("transition-transform group-hover:translate-x-1", isRTL && "rotate-180")} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800 flex items-center justify-center gap-4">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-all text-sm font-medium text-slate-300"
            >
              <Globe size={16} className="text-accent" />
              <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default Login;
