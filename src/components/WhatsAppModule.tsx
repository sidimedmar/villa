import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Tenant, Property } from '../types';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';

const WhatsAppModule = () => {
  const { t, isRTL } = useLanguage();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/tenants', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setTenants(data));

    fetch('/api/properties', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setProperties(data));
  }, []);

  const getPropertyInfo = (id: string) => properties.find(p => p.id === id);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.whatsapp.includes(search);
    const matchesFilter = filter === 'all' || t.payment_status === filter;
    return matchesSearch && matchesFilter;
  });

  const sendWhatsApp = (tenant: Tenant) => {
    const property = getPropertyInfo(tenant.property_id);
    const message = encodeURIComponent(
      `Bonjour ${tenant.name},\n\nCeci est un rappel concernant votre loyer pour le bien ${property?.name || tenant.property_id}.\nStatut actuel: ${t(`property.paymentStatus.${tenant.payment_status}`)}.\n\nMerci de régulariser votre situation.\n\nCordialement,\nImmoRIM`
    );
    window.open(`https://wa.me/${tenant.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'paid', 'unpaid', 'overdue', 'doubtful'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border capitalize",
                    filter === f 
                      ? "bg-primary text-white border-primary" 
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                  )}
                >
                  {f === 'all' ? 'Tous' : t(`property.paymentStatus.${f}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTenants.map((tenant) => {
              const property = getPropertyInfo(tenant.property_id);
              return (
                <motion.div
                  layout
                  key={tenant.id}
                  className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-accent/50 transition-all shadow-xl group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-accent/20 group-hover:text-accent transition-all">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100">{tenant.name}</h4>
                        <p className="text-xs text-slate-500">{tenant.whatsapp}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter",
                      tenant.payment_status === 'paid' ? "bg-success/20 text-success" : "bg-error/20 text-error"
                    )}>
                      {t(`property.paymentStatus.${tenant.payment_status}`)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 mb-6">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{t('common.properties')}</span>
                      <span className="text-slate-200 font-medium">{property?.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t('property.rent')}</span>
                      <span className="text-accent font-bold">{property?.rent_amount} {t('common.mru')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => sendWhatsApp(tenant)}
                    className="w-full py-3 bg-success hover:bg-success-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-success/20"
                  >
                    <Send size={18} />
                    {t('whatsapp.sendReminder')}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h4 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              Statistiques d'envoi
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Envoyés aujourd'hui</span>
                <span className="text-sm font-bold text-success">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">En attente</span>
                <span className="text-sm font-bold text-warning">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Échecs</span>
                <span className="text-sm font-bold text-error">0</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h4 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <HelpCircle size={16} className="text-primary" />
              Modèles rapides
            </h4>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 transition-all border border-slate-700">
                Rappel de loyer standard
              </button>
              <button className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 transition-all border border-slate-700">
                Avis de retard (3 jours)
              </button>
              <button className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 transition-all border border-slate-700">
                Confirmation de réception
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default WhatsAppModule;
