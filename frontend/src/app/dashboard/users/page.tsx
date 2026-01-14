'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Settings2, 
  ShieldAlert, 
  Mail, 
  Calendar,
  Loader2,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import UserRoleModal from '@/components/UserRoleModal';
import { Can } from '@/lib/permissions';

interface User {
  _id: string;
  email: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState('');

  const getCompanyId = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('erp_access_token='))?.split('=')[1];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.active_company_id;
      } catch (e) { return ''; }
    }
    return '';
  };

  useEffect(() => {
    const cid = getCompanyId();
    setActiveCompanyId(cid);
    fetchUsers(cid);
  }, []);

  const fetchUsers = async (cid: string) => {
    if (!cid) return;
    setIsLoading(true);
    try {
      const response = await api.get(`companies/${cid}/users`);
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-8 bg-blue-500 rounded-full"></div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Identity & Access</h1>
            </div>
            <p className="text-slate-400 font-medium">Provision users and configure organizational access hierarchies</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search users by identity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#1e293b]/50 border border-slate-800 text-slate-400 rounded-xl hover:text-white hover:border-slate-700 transition-all">
            <Filter className="w-5 h-5" />
            <span className="font-bold text-sm">Filters</span>
          </button>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
             Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-[#1e293b]/20 border border-slate-800/50 rounded-2xl animate-pulse" />
             ))
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className="group p-6 bg-[#1e293b]/30 border border-slate-800/60 rounded-3xl hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-blue-500 ring-4 ring-blue-500/5">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{user.email}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                          user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {user.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Enforce RBAC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Can I="users.edit">
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                      }}
                      className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all transform group-hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/10"
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                  </Can>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between text-slate-500">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <Mail className="w-3.5 h-3.5" />
                       <span className="text-[11px] font-bold">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5" />
                       <span className="text-[11px] font-bold">Last Sync: Today</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                </div>

                {/* Decorative background circle */}
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center opacity-30">
               <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold">No identities found</h3>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserRoleModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          user={selectedUser}
          companyId={activeCompanyId}
        />
      )}
    </div>
  );
}
