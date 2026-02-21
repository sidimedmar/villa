import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Payment, Property, Tenant } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  CreditCard, 
  Calendar, 
  User, 
  Building2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { fr, arSA } from 'date-fns/locale';

const Payments = () => {
  const { t, language, isRTL } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<Payment>>({
    property_id: '',
    tenant_id: 0,
    amount: 0,
    method: 'cash',
    status: 'paid'
  });

  useEffect(() => {
    fetchPayments();
    fetchProperties();
    fetchTenants();
  }, []);

  const fetchPayments = () => {
    setLoading(true);
    fetch('/api/payments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setPayments(data);
      setLoading(false);
    });
  };

  const fetchProperties = () => {
    fetch('/api/properties', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setProperties(data.filter((p: Property) => p.status === 'rented')));
  };

  const fetchTenants = () => {
    fetch('/api/tenants', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setTenants(data));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/payments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      fetchPayments();
      setIsModalOpen(false);
      setFormData({
        property_id: '',
        tenant_id: 0,
        amount: 0,
        method: 'cash',
        status: 'paid'
      });
    });
  };

  const handlePropertyChange = (propertyId: string) => {
    const tenant = tenants.find(t => t.property_id === propertyId);
    const property = properties.find(p => p.id === propertyId);
    setFormData({
      ...formData,
      property_id: propertyId,
      tenant_id: tenant?.id || 0,
      amount: property?.rent_amount || 0
    });
  };

  const dateLocale = language === 'fr' ? fr : arSA;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
            <Filter size={20} />
          </button>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all">
            <Download size={18} />
            {t('common.reports')}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            {t('common.add')}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">{t('payment.date')}</th>
                <th className="px-6 py-4 font-semibold">{t('common.properties')}</th>
                <th className="px-6 py-4 font-semibold">{t('tenant.name')}</th>
                <th className="px-6 py-4 font-semibold">{t('payment.amount')}</th>
                <th className="px-6 py-4 font-semibold">{t('payment.method')}</th>
                <th className="px-6 py-4 font-semibold">{t('payment.operator')}</th>
                <th className="px-6 py-4 font-semibold">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">{t('common.loading')}</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">Aucun paiement enregistré</td></tr>
              ) : payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={14} className="text-slate-500" />
                      <span className="text-sm">{format(new Date(payment.date), 'dd MMM yyyy', { locale: dateLocale })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-500" />
                      <span className="text-sm font-medium">{payment.property_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-500" />
                      <span className="text-sm">{payment.tenant_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-accent">{payment.amount.toLocaleString()} {t('common.mru')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CreditCard size={14} />
                      <span className="text-xs">{t(`payment.methods.${payment.method}`)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {payment.operator_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter",
                      payment.status === 'paid' ? "text-success" : "text-error"
                    )}>
                      {payment.status === 'paid' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {t(`property.paymentStatus.${payment.status}`)}
                    </span>
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
              className="relative w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">{t('common.add')} {t('common.payments')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.properties')}</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.property_id}
                      onChange={(e) => handlePropertyChange(e.target.value)}
                    >
                      <option value="">Sélectionner un bien loué</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">{t('payment.amount')}</label>
                      <input
                        required
                        type="number"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">{t('payment.method')}</label>
                      <select
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        value={formData.method}
                        onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                      >
                        <option value="cash">{t('payment.methods.cash')}</option>
                        <option value="bank">{t('payment.methods.bank')}</option>
                        <option value="check">{t('payment.methods.check')}</option>
                        <option value="mobile">{t('payment.methods.mobile')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">{t('common.status')}</label>
                    <div className="flex gap-4">
                      {['paid', 'unpaid', 'overdue', 'doubtful'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: status as any })}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-xs font-bold transition-all border",
                            formData.status === status 
                              ? "bg-primary/20 border-primary text-primary" 
                              : "bg-slate-800 border-slate-700 text-slate-500"
                          )}
                        >
                          {t(`property.paymentStatus.${status}`)}
                        </button>
                      ))}
                    </div>
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

export default Payments;
