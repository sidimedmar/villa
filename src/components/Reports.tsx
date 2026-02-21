import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar, 
  MapPin,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

const Reports = () => {
  const { t, language } = useLanguage();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/summary', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setReportData(data);
      setLoading(false);
    });
  }, []);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex items-center justify-center h-full text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-100">{t('common.reports')}</h3>
        <div className="flex gap-3">
          <button 
            onClick={() => exportToCSV(reportData.revenueByMonth, 'revenue_report')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-all"
          >
            <FileSpreadsheet size={16} className="text-success" />
            Excel (CSV)
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-all">
            <FileText size={16} className="text-error" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="text-accent" size={20} />
            {t('reports.revenueTrend')}
          </h4>
          <div className="space-y-4">
            {reportData.revenueByMonth.map((item: any) => (
              <div key={item.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{item.month}</span>
                  <span className="font-bold text-slate-100">{item.total.toLocaleString()} MRU</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (item.total / 100000) * 100)}%` }}
                    className="bg-accent h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debt by Province */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <MapPin className="text-error" size={20} />
            {t('reports.debtByProvince')}
          </h4>
          <div className="space-y-4">
            {reportData.debtByProvince.map((item: any) => (
              <div key={item.province} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-sm font-medium text-slate-200">{item.province}</span>
                <span className="text-sm font-bold text-error">{item.total_debt.toLocaleString()} MRU</span>
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <PieChart className="text-primary" size={20} />
            {t('reports.occupancyRate')}
          </h4>
          <div className="flex items-center justify-center py-10">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeDasharray="100, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                {reportData.occupancyStats.map((stat: any, index: number) => {
                  const total = reportData.occupancyStats.reduce((acc: number, s: any) => acc + s.count, 0);
                  const percentage = (stat.count / total) * 100;
                  const offset = reportData.occupancyStats.slice(0, index).reduce((acc: number, s: any) => acc + (s.count / total) * 100, 0);
                  const color = stat.status === 'rented' ? '#10b981' : stat.status === 'available' ? '#1e40af' : '#f59e0b';
                  
                  return (
                    <path
                      key={stat.status}
                      strokeDasharray={`${percentage}, 100`}
                      strokeDashoffset={-offset}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-100">
                  {Math.round((reportData.occupancyStats.find((s: any) => s.status === 'rented')?.count || 0) / reportData.occupancyStats.reduce((acc: number, s: any) => acc + s.count, 0) * 100)}%
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Loué</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {reportData.occupancyStats.map((stat: any) => (
              <div key={stat.status} className="text-center">
                <div className={cn(
                  "w-2 h-2 rounded-full mx-auto mb-1",
                  stat.status === 'rented' ? "bg-success" : stat.status === 'available' ? "bg-primary" : "bg-warning"
                )}></div>
                <p className="text-[10px] text-slate-500 uppercase">{t(`property.status.${stat.status}`)}</p>
                <p className="text-sm font-bold">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Distribution */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="text-success" size={20} />
            {t('reports.paymentDistribution')}
          </h4>
          <div className="space-y-6">
            {reportData.paymentStatusStats.map((stat: any) => (
              <div key={stat.payment_status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t(`property.paymentStatus.${stat.payment_status}`)}</span>
                  <span className="font-bold text-slate-100">{stat.count}</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.count / reportData.paymentStatusStats.reduce((acc: number, s: any) => acc + s.count, 0)) * 100}%` }}
                    className={cn(
                      "h-full",
                      stat.payment_status === 'paid' ? "bg-success" : 
                      stat.payment_status === 'overdue' ? "bg-warning" : 
                      stat.payment_status === 'doubtful' ? "bg-error" : "bg-slate-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default Reports;
