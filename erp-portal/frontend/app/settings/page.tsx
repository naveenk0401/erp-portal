'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Settings as SettingsIcon, Save, Moon, Sun, Bell, Globe, User } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'English',
    dashboard_layout: {}
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch('/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <SettingsIcon className="text-blue-600" size={32} /> System Settings
            </h2>
            <p className="text-slate-500 mt-1 font-bold text-sm opacity-70">
              Personalize your ERP experience and global preferences.
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </header>

        <div className="max-w-4xl space-y-8">
          {/* Profile Quick Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{user?.full_name}</h3>
              <p className="text-slate-500 font-bold">{user?.department} • {user?.role}</p>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Theme Selection */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Sun size={18} className="text-amber-500" /> Appearance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSettings({...settings, theme: 'light'})}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.theme === 'light' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <Sun size={24} className={settings.theme === 'light' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className={`text-xs font-black ${settings.theme === 'light' ? 'text-blue-600' : 'text-slate-500'}`}>Light</span>
                </button>
                <button 
                  onClick={() => setSettings({...settings, theme: 'dark'})}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.theme === 'dark' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <Moon size={24} className={settings.theme === 'dark' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className={`text-xs font-black ${settings.theme === 'dark' ? 'text-blue-600' : 'text-slate-500'}`}>Dark</span>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Bell size={18} className="text-rose-500" /> Notifications
              </h4>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-700">Push Notifications</span>
                <button 
                  onClick={() => setSettings({...settings, notifications: !settings.notifications})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.notifications ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notifications ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm md:col-span-2">
              <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Globe size={18} className="text-emerald-500" /> Localization
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['English', 'Hindi', 'Spanish', 'German'].map((lang) => (
                  <button 
                    key={lang}
                    onClick={() => setSettings({...settings, language: lang})}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${settings.language === lang ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
