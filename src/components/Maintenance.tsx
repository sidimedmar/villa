import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { 
  Plus, 
  Search, 
  Wrench, 
  Calendar, 
  DollarSign, 
  User, 
  Building2,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { fr, arSA } from 'date-fns/locale';

const Maintenance = () => {
  const { t, language, isRTL } = useLanguage();
  const [records, setRecords] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    property_id: '',
    type: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    cost: 0,
    status: 'pending',
    provider: '',
    description: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchProperties();
  }, []);

  const fetchRecords = () => {
    setLoading(true);
    fetch('/api/maintenance', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setRecords(data);
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
    fetch('/api/maintenance', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      fetchRecords();
      setIsModalOpen(false);
      setFormData({
        property_id: '',
        type: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        cost: 0,
        status: 'pending',
        provider: '',
        description: ''
      });
    });
  };

  const dateLocale = language === 'fr' ? fr : arSA;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-100">{t('common.maintenance')}</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t('maintenance.addRecord')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-500">{t('common.loading')}</div>
        ) : records.map((record) => (
          <motion.div
            layout
            key={record.id}
            className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-warning/50 transition-all shadow-xl group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                  <Wrench size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{record.type}</h4>
                  <p className="text-xs text-slate-500">{record.property_name}</p>
                </div>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter",
                record.status === 'completed' ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
              )}>
                {record.status}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Calendar size={14} /> {t('maintenance.date')}</span>
                <span className="text-slate-300">{format(new Date(record.date), 'dd MMM yyyy', { locale: dateLocale })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><User size={14} /> {t('maintenance.provider')}</span>
                <span className="text-slate-300">{record.provider}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><DollarSign size={14} /> {t('maintenance.cost')}</span>
                <span className="text-accent font-bold">{record.cost.toLocaleString()} MRU</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic line-clamp-2 border-t border-slate-800 pt-4">
              {record.description}
            </p>
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
              className="relative w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">{t('maintenance.addRecord')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.properties')}</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.property_id}
                      onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    >
                      <option value="">Sélectionner un bien</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('maintenance.type')}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('maintenance.date')}</label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('maintenance.cost')}</label>
                    <input
                      required
                      type="number"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('maintenance.provider')}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
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

export default Maintenance;
