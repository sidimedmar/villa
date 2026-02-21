import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Property } from '../types';
import { translations, mauritaniaData } from '../constants';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Building2, 
  MapPin, 
  DollarSign,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Properties = () => {
  const { t, isRTL, language } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<Partial<Property>>({
    id: `PRP-${Math.floor(100000 + Math.random() * 900000)}`,
    name: '',
    province: '',
    region: '',
    status: 'available',
    rent_amount: 0,
    payment_status: 'unpaid',
    type: 'apartment',
    area: 0,
    rooms: 0,
    description: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = () => {
    setLoading(true);
    fetch('/api/properties', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setProperties(data);
      setLoading(false);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProperty ? 'PUT' : 'POST';
    const url = editingProperty ? `/api/properties/${editingProperty.id}` : '/api/properties';

    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      fetchProperties();
      setIsModalOpen(false);
      setEditingProperty(null);
      setFormData({
        id: `PRP-${Math.floor(100000 + Math.random() * 900000)}`,
        name: '',
        province: '',
        region: '',
        status: 'available',
        rent_amount: 0,
        payment_status: 'unpaid',
        type: 'apartment',
        area: 0,
        rooms: 0,
        description: ''
      });
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(() => fetchProperties());
    }
  };

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProvince = mauritaniaData.provinces.find(p => p.id === formData.province);

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
            setEditingProperty(null);
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
        ) : filteredProperties.map((property) => (
          <motion.div
            layout
            key={property.id}
            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group hover:border-primary/50 transition-all shadow-xl"
          >
            <div className="h-40 bg-slate-800 relative">
              <img 
                src={`https://picsum.photos/seed/${property.id}/400/200`} 
                alt={property.name}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  property.status === 'rented' ? "bg-success/20 text-success" : 
                  property.status === 'available' ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning"
                )}>
                  {t(`property.status.${property.status}`)}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1">{property.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{property.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-accent">{property.rent_amount} <span className="text-xs">{t('common.mru')}</span></p>
                  <p className={cn(
                    "text-xs font-medium",
                    property.payment_status === 'paid' ? "text-success" : "text-error"
                  )}>
                    {t(`property.paymentStatus.${property.payment_status}`)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin size={14} className="text-slate-500" />
                  <span>{property.province}, {property.region}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Building2 size={14} className="text-slate-500" />
                  <span>{t(`property.types.${property.type}`)} • {property.area} m² • {property.rooms} {t('property.rooms')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingProperty(property);
                      setFormData(property);
                      setIsModalOpen(true);
                    }}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(property.id)}
                    className="p-2 hover:bg-error/10 rounded-lg text-slate-400 hover:text-error transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <button className="flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-all">
                  {t('common.actions')}
                  <ChevronRight size={16} className={isRTL ? "rotate-180" : ""} />
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
              className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingProperty ? t('common.edit') : t('common.add')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('property.name')}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('property.rent')}</label>
                    <input
                      required
                      type="number"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.rent_amount}
                      onChange={(e) => setFormData({ ...formData, rent_amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('property.province')}</label>
                    <select
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value, region: '' })}
                    >
                      <option value="">Sélectionner</option>
                      {mauritaniaData.provinces.map(p => (
                        <option key={p.id} value={p.id}>{language === 'fr' ? p.name.fr : p.name.ar}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('property.region')}</label>
                    <select
                      required
                      disabled={!formData.province}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    >
                      <option value="">Sélectionner</option>
                      {selectedProvince?.regions.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('property.type')}</label>
                    <select
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      {Object.keys(translations.fr.property.types).map(type => (
                        <option key={type} value={type}>{t(`property.types.${type}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.status')}</label>
                    <select
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="available">{t('property.status.available')}</option>
                      <option value="rented">{t('property.status.rented')}</option>
                      <option value="maintenance">{t('property.status.maintenance')}</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">{t('property.description')}</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default Properties;
