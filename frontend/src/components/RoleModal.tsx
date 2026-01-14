'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Check, Loader2, Lock } from 'lucide-react';
import api from '@/lib/api';

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

interface Role {
  _id?: string;
  name: string;
  description: string;
  permission_keys: string[];
  is_system: boolean;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  role?: Role | null;
}

export default function RoleModal({ isOpen, onClose, onSave, role }: RoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPermissions();
      if (role) {
        setName(role.name);
        setDescription(role.description);
        setSelectedKeys(role.permission_keys);
      } else {
        setName('');
        setDescription('');
        setSelectedKeys([]);
      }
      setError('');
    }
  }, [isOpen, role]);

  const fetchPermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      const response = await api.get('permissions/modules');
      setPermissionGroups(response.data);
    } catch (err: any) {
      console.error('Failed to fetch permissions', err);
      setError('Failed to load permissions list');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const togglePermission = (key: string) => {
    if (role?.is_system) return;
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Role name is required');
      return;
    }

    // Get active company ID from local storage (or wherever it's stored in your app)
    // For now, we'll try to find it from the token payload if needed, 
    // but the API takes it as a query param in the current backend design.
    // We'll need to ensure we have it.
    
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        name,
        description,
        permission_keys: selectedKeys
      };

      // We need to pass company_id. In a real app, this should be in the context.
      // Assuming for now it's accessible or the backend handles it via middleware 
      // (though our current API route takes it as a param).
      // Let's assume we can get it from the user's active_company_id.
      
      const token = document.cookie.split('; ').find(row => row.startsWith('erp_access_token='))?.split('=')[1];
      let companyId = '';
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        companyId = JSON.parse(jsonPayload).active_company_id;
      }

      if (role?._id) {
        await api.patch(`roles/${role._id}?company_id=${companyId}`, payload);
      } else {
        await api.post(`roles/?company_id=${companyId}`, payload);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save role');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {role ? (role.is_system ? 'View System Role' : 'Edit Role') : 'Create New Role'}
              </h2>
              <p className="text-sm text-slate-400">Define capabilities and module access</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Role Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={role?.is_system}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
                placeholder="e.g. Inventory Manager"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={role?.is_system}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 min-h-[80px]"
                placeholder="Briefly describe the responsibilities of this role"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  Permissions
                  {role?.is_system && (
                    <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      <Lock className="w-3 h-3" /> Read Only
                    </span>
                  )}
                </label>
                <span className="text-xs text-slate-500">
                  {selectedKeys.length} selected
                </span>
              </div>

              {isLoadingPermissions ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-sm text-slate-400">Loading permissions...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {permissionGroups.map((group) => (
                    <div key={group.module} className="bg-[#1e293b]/50 rounded-xl border border-slate-800/50 overflow-hidden">
                      <div className="bg-[#1e293b] px-4 py-2 border-b border-slate-800/50">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group.module}</h4>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.permissions.map((perm) => (
                          <div 
                            key={perm.key}
                            onClick={() => togglePermission(perm.key)}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              selectedKeys.includes(perm.key)
                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                : 'bg-transparent border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              selectedKeys.includes(perm.key)
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'bg-[#0f172a] border-slate-700'
                            }`}>
                              {selectedKeys.includes(perm.key) && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${selectedKeys.includes(perm.key) ? 'text-white' : 'text-slate-300'}`}>
                                {perm.action.charAt(0).toUpperCase() + perm.action.slice(1)}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3 bg-[#1e293b]/20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          {!role?.is_system && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Role'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
