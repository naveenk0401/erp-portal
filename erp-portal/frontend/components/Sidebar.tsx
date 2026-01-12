'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  IndianRupee, 
  Building2,
  LogOut, 
  Menu, 
  X,
  Briefcase,
  ShieldCheck,
  PlaneTakeoff,
  BarChart3,
  HardDrive,
  FileText,
  Settings,
  History,
  Bell,
  Layers,
  Star,
  TrendingUp,
  Activity,
  Zap,
  MessageSquare,
  GanttChart,
  UserCheck,
  BookOpen,
  Cpu,
  UserPlus,
  ClipboardCheck,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const navGroups = [
    {
      title: 'Command Center',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['super_admin'] },
        { name: 'Insights', icon: Zap, href: '/insights', roles: ['super_admin'] },
        { name: 'ERP Assistant', icon: MessageSquare, href: '/assistant', roles: ['super_admin'] },
      ]
    },
    {
      title: 'Strategy & Growth',
      items: [
        { name: 'OKRs', icon: GanttChart, href: '/okrs', roles: ['super_admin', 'department_head'] },
        { name: 'Financials', icon: TrendingUp, href: '/financials', roles: ['super_admin'] },
        { name: 'Reports', icon: BarChart3, href: '/reports', roles: ['super_admin'] },
      ]
    },
    {
      title: 'Work Engine',
      items: [
        { name: 'Projects', icon: Layers, href: '/projects', roles: ['super_admin', 'department_head'] },
        { name: 'Sprints', icon: Activity, href: '/sprints', roles: ['super_admin', 'department_head'] },
        { name: 'Tasks', icon: CheckSquare, href: '/tasks', roles: ['super_admin', 'department_head', 'department_manager', 'team_lead', 'employee'] },
      ]
    },
    {
      title: 'HR Panel',
      items: [
        { name: 'Onboarding', icon: UserPlus, href: '/hr/onboarding', roles: ['super_admin', 'department_head', 'employee'] },
        { name: 'Approvals', icon: ClipboardCheck, href: '/hr/approvals', roles: ['super_admin', 'department_head'] },
        { name: 'ID Card', icon: CreditCard, href: '/hr/id-card', roles: ['super_admin', 'department_head', 'employee'] },
      ]
    },
    {
      title: 'CRM Suite',
      items: [
        { name: 'CRM Dashboard', icon: LayoutDashboard, href: '/crm/dashboard', roles: ['super_admin', 'department_head'] },
        { name: 'Leads', icon: Users, href: '/crm/leads', roles: ['super_admin', 'department_head', 'employee'] },
        { name: 'Deals', icon: TrendingUp, href: '/crm/deals', roles: ['super_admin', 'department_head'] },
      ]
    },
    {
      title: 'Human Capital',
      items: [
        { name: 'Employees', icon: Users, href: '/users', roles: ['super_admin', 'department_head'] },
        { name: 'Employee Analytics', icon: UserCheck, href: '/employee-analytics', roles: ['super_admin', 'department_head'] },
        { name: 'HR Operations', icon: Briefcase, href: '/hr-ops', roles: ['super_admin', 'department_head'] },
        { name: 'Payroll', icon: IndianRupee, href: '/salaries', roles: ['super_admin', 'accountant'] },
        { name: 'Attendance', icon: Calendar, href: '/attendance', roles: ['super_admin', 'department_head', 'employee'] },
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Rules Engine', icon: Cpu, href: '/rules', roles: ['super_admin'] },
        { name: 'Assets', icon: HardDrive, href: '/assets', roles: ['super_admin'] },
        { name: 'Documents', icon: FileText, href: '/documents', roles: ['super_admin', 'department_head', 'employee'] },
        { name: 'Wiki', icon: BookOpen, href: '/wiki', roles: ['super_admin', 'department_head', 'employee'] },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Audit Logs', icon: History, href: '/audit-logs', roles: ['super_admin'] },
        { name: 'Verify Service', icon: ShieldCheck, href: '/verify', roles: ['super_admin', 'department_head', 'employee'] },
        { name: 'Settings', icon: Settings, href: '/settings', roles: ['super_admin'] },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold">ERP Portal</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white p-6 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 overflow-y-auto custom-scrollbar
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Briefcase size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight hidden md:block">ERP Portal</h1>
        </div>

        <nav className="space-y-8">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter(item => {
              if (item.roles.includes(user.role)) return true;
              return false;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title}>
                <h3 className="px-3 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <item.icon size={18} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          <div className="pt-6 border-t border-slate-800">
            <button 
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-all w-full text-left font-bold text-sm"
            >
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
