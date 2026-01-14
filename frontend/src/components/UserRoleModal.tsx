'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Users, Check, Loader2, ShieldCheck, Info } from 'lucide-react';
import api from '@/lib/api';

interface Role {
  _id: string;
  name: string;
  description: string;
  permission_keys: string[];
  is_system: boolean;
}

interface User {
  _id: string;
  email: string;
  status: string;
}

interface Permission {
  _id: string;
  key: string;
  module: string;
  action: string;
  description: string;
}

interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  companyId: string;
}

export default function UserRoleModal({ isOpen, onClose, user, companyId }: UserRoleModalProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [rolesRes, userRolesRes, permsRes] = await Promise.all([
        api.get(`roles/?company_id=${companyId}`),
        api.get(`roles/user/${user?._id}?company_id=${companyId}`),
        api.get('permissions/modules')
      ]);
      setAllRoles(rolesRes.data);
      setAssignedRoles(userRolesRes.data);
      setPermissionGroups(permsRes.data);
    } catch (err) {
      setError('Failed to load role data');
    } finally {
      setIsLoading(false);
    }
  };

  const effectivePermissions = useMemo(() => {
    const keys = new Set<string>();
    assignedRoles.forEach(role => {
      role.permission_keys.forEach(k => keys.add(k));
    });
    return keys;
  }, [assignedRoles]);

  const toggleRole = async (role: Role) => {
    const isAssigned = assignedRoles.some(r => r._id === role._id);
    setIsSaving(true);
    try {
      if (isAssigned) {
        await api.post(`roles/revoke?company_id=${companyId}`, {
          user_id: user?._id,
          role_id: role._id
        });
        setAssignedRoles(prev => prev.filter(r => r._id !== role._id));
      } else {
        await api.post(`roles/assign?company_id=${companyId}`, {
          user_id: user?._id,
          role_id: role._id
        });
        setAssignedRoles(prev => [...prev, role]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update role');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Manage User Roles</h2>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-slate-400">Synchronizing permissions...</p>
            </div>
          ) : (
            <>
              {/* Left Side: Role Selection */}
              <div className="w-full md:w-1/2 border-r border-slate-800 flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-800">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    Available Roles
                    <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">{allRoles.length}</span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs">{error}</div>}
                  {allRoles.map(role => (
                    <div 
                      key={role._id}
                      onClick={() => !isSaving && toggleRole(role)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                        assignedRoles.some(r => r._id === role._id)
                          ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20'
                          : 'bg-[#1e293b]/30 border-slate-800 hover:border-slate-700'
                      } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-bold text-sm ${assignedRoles.some(r => r._id === role._id) ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {role.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{role.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          assignedRoles.some(r => r._id === role._id)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#0f172a] border border-slate-700'
                        }`}>
                          {assignedRoles.some(r => r._id === role._id) && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Effective Permissions */}
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0f172a]/50">
                <div className="p-4 bg-[#1e293b]/50 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Effective Permissions
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                    {effectivePermissions.size} Access Points
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {effectivePermissions.size === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Info className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">No permissions granted</p>
                      <p className="text-xs mt-1">Select one or more roles to see effective access</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {permissionGroups.map(group => {
                        const activeInGroup = group.permissions.filter(p => effectivePermissions.has(p.key));
                        if (activeInGroup.length === 0) return null;
                        
                        return (
                          <div key={group.module} className="space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{group.module}</h4>
                            <div className="grid grid-cols-1 gap-1">
                              {activeInGroup.map(perm => (
                                <div key={perm.key} className="flex items-center gap-2 p-2 bg-[#1e293b]/40 rounded-lg border border-slate-800/50">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                  <span className="text-xs font-bold text-slate-300 w-16">{perm.action}</span>
                                  <span className="text-xs text-slate-500 line-clamp-1">{perm.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-[#1e293b]/20">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Live Cloud Sync Active
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
