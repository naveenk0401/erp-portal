'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, LogOut, Building, 
  Settings as SettingsIcon, Shield, Package, UserSquare, 
  BaggageClaim, Layers, Percent, ClipboardList 
} from 'lucide-react';
import { clearTokens } from '@/lib/auth';
import { usePermissions } from '@/lib/permissions';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  const logout = () => {
    clearTokens();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Roles', icon: Shield, path: '/dashboard/roles', requiredPermission: 'roles.view' },
    { name: 'Identity', icon: Users, path: '/dashboard/users', requiredPermission: 'users.view' },
    { name: 'Customers', icon: UserSquare, path: '/dashboard/masters/customers', requiredPermission: 'customers.view' },
    { name: 'Vendors', icon: BaggageClaim, path: '/dashboard/masters/vendors', requiredPermission: 'vendors.view' },
    { name: 'Items', icon: Package, path: '/dashboard/masters/items', requiredPermission: 'items.view' },
    { name: 'Categories', icon: Layers, path: '/dashboard/masters/categories', requiredPermission: 'categories.view' },
    { name: 'Taxes', icon: Percent, path: '/dashboard/masters/taxes', requiredPermission: 'taxes.view' },
    { name: 'Price Lists', icon: ClipboardList, path: '/dashboard/masters/price-lists', requiredPermission: 'price_lists.view' },
    { name: 'Settings', icon: SettingsIcon },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Building className="text-white" size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">ERP Portal</span>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => item.path && router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <button 
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-all mt-auto"
      >
        <LogOut size={20} />
        <span className="font-medium">Sign Out</span>
      </button>
    </aside>
  );
}
