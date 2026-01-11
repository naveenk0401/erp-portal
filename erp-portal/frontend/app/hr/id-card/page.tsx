'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Download, 
  Printer, 
  User, 
  Building, 
  QrCode,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function IDCardPage() {
  const { user } = useAuthStore();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIDCard();
  }, []);

  const fetchIDCard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr-core/id-card');
      setEmployeeData(response.data);
    } catch (error) {
      console.error('Error fetching ID card:', error);
      // Fallback to user profile if ID card record doesn't exist yet
      if (user) {
        setEmployeeData({
          name: user.full_name,
          id: user.id || 'N/A',
          dept: user.department || 'N/A',
          designation: user.role || 'Employee',
          doj: 'N/A',
          bloodGroup: 'N/A',
          emergency: 'N/A'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <CreditCard size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Authenticating Identity...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!employeeData) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Employee Identification System</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Corporate ID Card</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Digital Twin & Print Ready Identity</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
              <Printer size={18} /> Print Card
            </button>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2">
              <Download size={18} /> Download PDF
            </button>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center py-10">
          {/* ID CARD FRONT */}
          <div className="w-[350px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative flex flex-col print:shadow-none">
            {/* Design Elements */}
            <div className="absolute top-0 left-0 w-full h-32 bg-slate-900 -skew-y-6 -translate-y-12"></div>
            
            {/* Header */}
            <div className="relative z-10 p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Building size={16} />
                </div>
                <span className="font-black tracking-tight text-sm">ERP PORTAL</span>
              </div>
              <ShieldCheck size={20} className="text-blue-400" />
            </div>

            {/* Photo Section */}
            <div className="relative flex justify-center mt-4">
              <div className="w-32 h-32 rounded-3xl bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-200">
                <User size={64} />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 flex flex-col items-center text-center p-8 space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{employeeData.name}</h3>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">{employeeData.designation}</p>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              <div className="grid grid-cols-2 w-full gap-4">
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee ID</p>
                  <p className="text-[11px] font-bold text-slate-900">{employeeData.id}</p>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                  <p className="text-[11px] font-bold text-slate-900">{employeeData.dept}</p>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date of Joining</p>
                  <p className="text-[11px] font-bold text-slate-900">{employeeData.doj}</p>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blood Group</p>
                  <p className="text-[11px] font-bold text-slate-900">{employeeData.bloodGroup}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-6 flex justify-between items-center">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                <div className="h-6 w-24 bg-slate-100 rounded mt-1 border border-slate-200/50"></div>
              </div>
              <QrCode size={40} className="text-slate-300" />
            </div>
          </div>

          <p className="mt-10 text-slate-400 text-xs font-bold max-w-sm text-center">
            This card remains the property of ERP Portal. If found, please return to the nearest HR department or office.
          </p>
        </div>
      </main>
    </div>
  );
}
