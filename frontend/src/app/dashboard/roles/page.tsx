'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Lock, 
  Users, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import RoleModal from '@/components/RoleModal';
import Sidebar from '@/components/Sidebar';
import { Can } from '@/lib/permissions';

interface Role {
  _id: string;
  name: string;
  description: string;
  permission_keys: string[];
  is_system: boolean;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState('');

  // Get active company ID from local storage or cookie
  const getCompanyId = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('erp_access_token='))?.split('=')[1];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.active_company_id;
      } catch (e) {
        return '';
      }
    }
    return '';
  };

  const fetchRoles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const companyId = getCompanyId();
      const response = await api.get(`roles/?company_id=${companyId}`);
      setRoles(response.data);
    } catch (err: any) {
      console.error('Failed to fetch roles', err);
      setError('Failed to load roles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;
    
    try {
      const companyId = getCompanyId();
      await api.delete(`roles/${roleId}?company_id=${companyId}`);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete role');
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-8 bg-emerald-500 rounded-full"></div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Access Management</h1>
          </div>
          <p className="text-slate-400 font-medium">Configure roles and granular permissions for your organization</p>
        </div>

        <Can I="roles.manage">
          <button 
            onClick={() => {
              setSelectedRole(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create New Role
          </button>
        </Can>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1e293b]/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Roles</p>
              <p className="text-2xl font-black text-white">{roles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1e293b]/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">System Protected</p>
              <p className="text-2xl font-black text-white">{roles.filter(r => r.is_system).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1e293b]/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Custom Roles</p>
              <p className="text-2xl font-black text-white">{roles.filter(r => !r.is_system).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#1e293b]/30 border border-slate-800/60 rounded-3xl overflow-hidden backdrop-blur-md">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800 border-dashed flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search roles by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all font-medium"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <AlertCircle className="w-4 h-4" />
            System roles can be viewed but not modified
          </div>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-500/50" />
                </div>
              </div>
              <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Authenticating Workspace...</p>
            </div>
          ) : filteredRoles.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a]/50">
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Role Identity</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Description</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 text-center">Permissions</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right pr-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredRoles.map((role) => (
                  <tr key={role._id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          role.is_system 
                            ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' 
                            : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                        }`}>
                          {role.is_system ? <Lock className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-white font-bold text-base group-hover:text-emerald-400 transition-colors">{role.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {role.is_system && (
                              <span className="text-[10px] font-black bg-amber-500/10 text-amber-500 px-2 rounded-md uppercase tracking-tighter py-0.5">System</span>
                            )}
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">ID: {role._id.slice(-6)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-slate-400 text-sm leading-relaxed max-w-xs line-clamp-2 italic font-medium">
                        "{role.description || 'No description provided'}"
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-slate-300 text-xs font-bold">
                          {role.permission_keys.length} Scopes Active
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Can I="roles.manage" fallback={
                          <button 
                            onClick={() => {
                              setSelectedRole(role);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-all"
                            title="View Details"
                          >
                            <Search className="w-5 h-5" />
                          </button>
                        }>
                          <button 
                            onClick={() => {
                              setSelectedRole(role);
                              setIsModalOpen(true);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              role.is_system 
                                ? 'text-slate-500 hover:bg-slate-800 hover:text-white' 
                                : 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300'
                            }`}
                            title={role.is_system ? "View Details" : "Edit Role"}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          {!role.is_system && (
                            <button 
                              onClick={() => handleDelete(role._id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all"
                              title="Delete Role"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </Can>
                        <button className="p-2 text-slate-600 hover:text-white transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">No roles matches your search</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-emerald-500 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-[#0f172a]/20 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Showing {filteredRoles.length} of {roles.length} total rules
          </p>
          <div className="flex gap-2">
            <div className="h-1 w-8 bg-emerald-500/20 rounded-full"></div>
            <div className="h-1 w-2 bg-emerald-500/50 rounded-full"></div>
            <div className="h-1 w-2 bg-emerald-500/50 rounded-full"></div>
          </div>
        </div>
      </div>

      <RoleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={() => fetchRoles()}
        role={selectedRole}
      />
    </div>
  </div>
);
}
