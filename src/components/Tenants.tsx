import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Tenant, Property } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  Phone, 
  Star, 
  FileText,
  X,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Tenants = () => {
  const { t, language } = useLanguage();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<Tenant>>({
    name: '',
    whatsapp: '',
    property_id: '',
    payment_status: 'unpaid',
    id_card: '',
    rating: 'good',
    notes: ''
  });

  useEffect(() => {
    fetchTenants();
    fetchProperties();
  }, []);

  const fetchTenants = () => {
    setLoading(true);
    fetch('/api/tenants', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setTenants(data);
      setLoading(false);
    });
  };

  const fetchProperties = () => {
    fetch('/api/properties', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setProperties(data));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTenant ? 'PUT' : 'POST';
    const url = editingTenant ? `/api/tenants/${editingTenant.id}` : '/api/tenants';

    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      fetchTenants();
      setIsModalOpen(false);
      setEditingTenant(null);
      setFormData({
        name: '',
        whatsapp: '',
        property_id: '',
        payment_status: 'unpaid',
        id_card: '',
        rating: 'good',
        notes: ''
      });
    });
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.whatsapp.includes(search)
  );

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-accent';
      case 'average': return 'text-warning';
      case 'bad': return 'text-error';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setEditingTenant(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t('common.add')}
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">{t('tenant.name')}</th>
                <th className="px-6 py-4 font-semibold">{t('tenant.whatsapp')}</th>
                <th className="px-6 py-4 font-semibold">{t('common.properties')}</th>
                <th className="px-6 py-4 font-semibold">{t('tenant.rating')}</th>
                <th className="px-6 py-4 font-semibold">{t('common.status')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">{t('common.loading')}</td></tr>
              ) : filteredTenants.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Aucun locataire trouvé</td></tr>
              ) : filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <User size={20} />
                      </div>
                      <span className="font-medium text-slate-200">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone size={14} />
                      <span>{tenant.whatsapp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{tenant.property_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn("flex items-center gap-1 text-sm font-medium", getRatingColor(tenant.rating))}>
                      <Star size={14} fill="currentColor" />
                      {t(`tenant.ratings.${tenant.rating}`)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter",
                      tenant.payment_status === 'paid' ? "bg-success/20 text-success" : "bg-error/20 text-error"
                    )}>
                      {t(`property.paymentStatus.${tenant.payment_status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingTenant(tenant);
                          setFormData(tenant);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-all">
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingTenant ? t('common.edit') : t('common.add')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('tenant.name')}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('tenant.whatsapp')}</label>
                    <input
                      required
                      type="text"
                      placeholder="+222..."
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.properties')}</label>
                    <select
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.property_id}
                      onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    >
                      <option value="">Sélectionner</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('tenant.rating')}</label>
                    <select
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value as any })}
                    >
                      {Object.keys(translations.fr.tenant.ratings).map(r => (
                        <option key={r} value={r}>{t(`tenant.ratings.${r}`)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">{t('tenant.notes')}</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="pt-6 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                  >
                    {t('common.cancel')}
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

import { translations } from '../constants';

export default Tenants;
