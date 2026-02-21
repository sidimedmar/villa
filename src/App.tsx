/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Map as MapIcon, 
  UserCog, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---
import Dashboard from './components/Dashboard';
import Properties from './components/Properties';
import Tenants from './components/Tenants';
import Payments from './components/Payments';
import WhatsAppModule from './components/WhatsAppModule';
import MapView from './components/MapView';
import UserManagement from './components/UserManagement';
import Login from './components/Login';

const AppContent = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogin = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (newUser.language) setLanguage(newUser.language);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('common.dashboard') },
    { id: 'properties', icon: Building2, label: t('common.properties') },
    { id: 'tenants', icon: Users, label: t('common.tenants') },
    { id: 'payments', icon: CreditCard, label: t('common.payments') },
    { id: 'whatsapp', icon: MessageSquare, label: t('common.whatsapp') },
    { id: 'map', icon: MapIcon, label: t('common.map') },
    { id: 'users', icon: UserCog, label: t('common.users'), adminOnly: true },
    { id: 'reports', icon: FileText, label: t('common.reports') },
  ].filter(item => !item.adminOnly || user.role === 'admin');

  return (
    <div className="min-h-screen flex bg-bg-dark text-slate-200">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className={cn(
          "fixed inset-y-0 z-50 bg-slate-900 border-slate-800 transition-all duration-300",
          isRTL ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            {isSidebarOpen && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              >
                ImmoRIM
              </motion.h1>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                  activeTab === item.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                )}
              >
                <item.icon size={22} className={cn(activeTab === item.id ? "text-white" : "group-hover:text-accent")} />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl text-error hover:bg-error/10 transition-all",
                !isSidebarOpen && "justify-center"
              )}
            >
              <LogOut size={22} />
              {isSidebarOpen && <span>{t('common.logout')}</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-h-screen flex flex-col",
          isSidebarOpen ? (isRTL ? "mr-[260px]" : "ml-[260px]") : (isRTL ? "mr-[80px]" : "ml-[80px]")
        )}
      >
        {/* Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-100">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-all text-sm font-medium"
            >
              <Globe size={16} className="text-accent" />
              <span>{language === 'fr' ? 'AR' : 'FR'}</span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-100">{user.username}</p>
                <p className="text-xs text-slate-500 capitalize">{t(`common.${user.role}`)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                {user.username[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'properties' && <Properties />}
              {activeTab === 'tenants' && <Tenants />}
              {activeTab === 'payments' && <Payments />}
              {activeTab === 'whatsapp' && <WhatsAppModule />}
              {activeTab === 'map' && <MapView />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'reports' && <div className="text-center py-20 text-slate-500 italic">Module de rapports en cours de développement...</div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
