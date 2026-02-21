import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { User } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User as UserIcon, 
  Shield, 
  ShieldAlert,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const UserManagement = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'operator',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setUsers(data);
      setLoading(false);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';

    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'operator', status: 'active' });
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t('common.confirmDelete'))) {
      fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(() => fetchUsers());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-100">{t('common.users')}</h3>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t('common.add')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-500">{t('common.loading')}</div>
        ) : users.map((user) => (
          <motion.div
            layout
            key={user.id}
            className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-primary/50 transition-all shadow-xl group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{user.username}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    {user.role === 'admin' ? <Shield size={12} className="text-accent" /> : <ShieldAlert size={12} />}
                    <span className="capitalize">{t(`common.${user.role}`)}</span>
                  </div>
                </div>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1",
                user.status === 'active' ? "bg-success/20 text-success" : "bg-error/20 text-error"
              )}>
                {user.status === 'active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {t(`common.${user.status}`)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500 italic">Créé le {new Date(user.created_at).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingUser(user);
                    setFormData({ username: user.username, password: '', role: user.role, status: user.status });
                    setIsModalOpen(true);
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="p-2 hover:bg-error/10 rounded-lg text-slate-400 hover:text-error transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingUser ? t('common.edit') : t('common.add')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.username')}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.password')}</label>
                    <input
                      required={!editingUser}
                      type="password"
                      placeholder={editingUser ? "Laisser vide pour ne pas changer" : ""}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.role')}</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    >
                      <option value="admin">{t('common.admin')}</option>
                      <option value="operator">{t('common.operator')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.status')}</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="active">{t('common.active')}</option>
                      <option value="inactive">{t('common.inactive')}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default UserManagement;
