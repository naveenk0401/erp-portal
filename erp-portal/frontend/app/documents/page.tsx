'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  FileText, 
  Search, 
  Filter, 
  Upload, 
  MoreVertical, 
  File, 
  FileImage, 
  FileArchive,
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  Globe,
  RefreshCcw,
  PlusCircle,
  FolderOpen
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function DocumentsPage() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/content/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || doc.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText size={18} className="text-rose-500" />;
    if (type.includes('doc') || type.includes('txt')) return <File size={18} className="text-blue-500" />;
    if (type.includes('png') || type.includes('jpg') || type.includes('svg')) return <FileImage size={18} className="text-emerald-500" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive size={18} className="text-amber-500" />;
    return <FileText size={18} className="text-slate-400" />;
  };

  const categories = ['all', 'Policy', 'Contract', 'ID Proof', 'Salary Slip'];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Secure Cloud Storage v4.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Documents & Vault</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Enterprise Compliance & Legal Repository</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchDocuments} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2">
              <Upload size={16} /> Upload New
            </button>
          </div>
        </header>

        {/* 1. Quick Stats & Folders */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Categories</h3>
                <FolderOpen size={18} className="text-blue-500" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(1).map(cat => (
                    <div key={cat} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer group">
                        <div className="bg-white p-3 rounded-xl w-fit mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-slate-100">
                             <FileText size={20} />
                        </div>
                        <p className="text-xs font-black text-slate-900">{cat}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">12 Files</p>
                    </div>
                ))}
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vault Capacity</p>
              <h4 className="text-2xl font-black">2.4 GB <span className="text-xs text-slate-500 font-bold tracking-normal">/ 10 GB</span></h4>
            </div>
            <div className="space-y-2 mt-auto">
               <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[24%]" />
               </div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Encrypted & Geo-Redundant</p>
            </div>
          </div>
        </div>

        {/* 2. File Explorer */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl w-fit">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Find a document..." 
                  className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 w-full lg:w-72"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center">
                <div className="animate-spin text-blue-500 mb-4 flex justify-center"><RefreshCcw size={32} /></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Encrypted Records...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">File Name</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Size</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Visibility</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Modified</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center opacity-30 italic font-bold text-slate-400">
                        The vault is currently empty for this selection.
                      </td>
                    </tr>
                  )}
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                             {getFileIcon(doc.file_type)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{doc.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{doc.file_type.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{doc.category}</span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-600">{(doc.size / 1024).toFixed(1)} KB</p>
                      </td>
                      <td className="px-8 py-6">
                         {doc.is_public ? (
                           <div className="flex items-center gap-1.5 text-emerald-600">
                              <Globe size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Public</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-1.5 text-blue-600">
                              <Lock size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Private</span>
                           </div>
                         )}
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-xs font-bold text-slate-500 truncate">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <Download size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                <Trash2 size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
