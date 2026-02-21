import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Stats } from '../types';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HelpCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

const StatCard = ({ title, value, icon: Icon, color, suffix = "" }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-100">
          {typeof value === 'number' ? value.toLocaleString() : value} {suffix}
        </h3>
      </div>
      <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.totalProperties')} 
          value={stats?.totalProperties} 
          icon={Building2} 
          color="primary" 
        />
        <StatCard 
          title={t('dashboard.rentedProperties')} 
          value={stats?.rentedProperties} 
          icon={CheckCircle2} 
          color="success" 
        />
        <StatCard 
          title={t('dashboard.totalRent')} 
          value={stats?.totalRent} 
          icon={TrendingUp} 
          color="accent" 
          suffix={t('common.mru')}
        />
        <StatCard 
          title={t('dashboard.totalDebt')} 
          value={stats?.totalDebt} 
          icon={AlertCircle} 
          color="error" 
          suffix={t('common.mru')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Status Overview */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Clock className="text-accent" size={20} />
            {t('dashboard.monthlyReceipts')}
          </h4>
          <div className="space-y-6">
             {/* Simple visual representation */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm text-slate-400">{t('property.paymentStatus.paid')}</span>
                </div>
                <span className="font-bold">75%</span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-success h-full w-[75%]"></div>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-sm text-slate-400">{t('property.paymentStatus.overdue')}</span>
                </div>
                <span className="font-bold">15%</span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-warning h-full w-[15%]"></div>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <span className="text-sm text-slate-400">{t('property.paymentStatus.doubtful')}</span>
                </div>
                <span className="font-bold">10%</span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-error h-full w-[10%]"></div>
             </div>
          </div>
        </div>

        {/* Active Users / Quick Info */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="text-primary" size={20} />
            {t('dashboard.activeUsers')}
          </h4>
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Users size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.activeUsers}</p>
              <p className="text-sm text-slate-400">{t('dashboard.activeUsers')}</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-accent/10 rounded-xl border border-accent/20">
            <p className="text-sm text-accent font-medium mb-2 flex items-center gap-2">
              <HelpCircle size={16} />
              Conseil du jour
            </p>
            <p className="text-sm text-slate-300 italic">
              "Pensez à vérifier les paiements en retard chaque fin de semaine pour optimiser vos recouvrements."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
