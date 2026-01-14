import React from 'react';
import { useAuthStore } from '@/lib/store';
import { ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedDepartments?: string[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  children, 
  allowedRoles, 
  allowedDepartments, 
  fallback,
  showFallback = false 
}) => {
  const { user } = useAuthStore();

  if (!user) return null;

  const hasRole = !allowedRoles || allowedRoles.includes(user.role);
  const hasDept = !allowedDepartments || allowedDepartments.includes(user.department);

  if (hasRole && hasDept) {
    return <>{children}</>;
  }

  if (showFallback) {
    return <>{fallback || <DefaultRestrictedState />}</>;
  }

  return null;
};

const DefaultRestrictedState = () => (
  <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center bg-slate-50/30">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
      <ShieldAlert size={24} />
    </div>
    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Access Restricted</h4>
    <p className="text-xs font-bold text-slate-400 max-w-[200px]">You don't have permission to view this specific analytic module.</p>
  </div>
);
