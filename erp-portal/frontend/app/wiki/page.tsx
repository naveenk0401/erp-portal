'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  BookOpen, 
  Search, 
  FileText, 
  ChevronRight, 
  Plus, 
  Folder, 
  Clock, 
  Star,
  Hash,
  ArrowUpRight,
  MoreVertical,
  History,
  RefreshCcw,
  ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function WikiPage() {
  const { user } = useAuthStore();
  const [wikiPages, setWikiPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWiki();
  }, []);

  const fetchWiki = async () => {
    try {
      setLoading(true);
      const response = await api.get('/content/wiki');
      setWikiPages(response.data);
    } catch (error) {
      console.error('Error fetching wiki:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWiki = wikiPages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: 1, name: 'Human Resources', count: 24, icon: <FileText size={18} />, color: 'text-blue-600 bg-blue-50' },
    { id: 2, name: 'Product Specs', count: 12, icon: <Star size={18} />, color: 'text-amber-600 bg-amber-50' },
    { id: 3, name: 'Tech Documentation', count: 48, icon: <Hash size={18} />, color: 'text-emerald-600 bg-emerald-50' },
    { id: 4, name: 'Compliance & Tax', count: 8, icon: <Folder size={18} />, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        
        {/* Search Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto pt-10">
          <div className="bg-blue-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 text-white">
            <BookOpen size={32} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Enterprise Knowledge Base</h2>
          <p className="text-slate-500 font-bold mb-8 opacity-80 uppercase text-[10px] tracking-widest">Centralized Repository for Organizational Intelligence</p>
          
          <div className="relative group max-w-xl mx-auto">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
             <input 
              type="text" 
              placeholder="Query the secure intelligence vault..." 
              className="w-full pl-16 pr-6 py-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 text-lg font-black placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {categories.map((cat) => (
             <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <div className={`p-4 rounded-2xl w-fit mb-6 ${cat.color} group-hover:scale-110 transition-transform`}>
                   {cat.icon}
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-1">{cat.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cat.count} Articles</p>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Recent Updates */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center px-2">
                 <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" /> Secure Knowledge Ledger
                 </h3>
                 <div className="flex gap-2">
                    <button onClick={fetchWiki} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Plus size={14} /> Create Record
                    </button>
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin text-blue-500 mb-4 flex justify-center"><RefreshCcw size={32} /></div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Secure Core Wiki...</p>
                        </div>
                    ) : (
                        <>
                            {filteredWiki.length === 0 && (
                                <div className="p-20 text-center opacity-30 italic font-bold text-slate-400">
                                    No records found matching your cryptographic signature.
                                </div>
                            )}
                            {filteredWiki.map((article) => (
                                <div key={article.id} className="p-8 hover:bg-slate-50/50 transition-colors group flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer capitalize">{article.title}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                                {article.category || 'GENERAL'} • Updated {new Date(article.updated_at || article.created_at).toLocaleDateString()} by {article.author_name || 'AUTHENTICATED USER'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="p-2 text-slate-300 hover:text-slate-600"><History size={18} /></button>
                                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-all"><MoreVertical size={18} /></button>
                                        <ChevronRight size={24} className="text-slate-100 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                 </div>
              </div>
           </div>

           {/* Quick Access/Pinned */}
           <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 px-2">Strategic Pinboard</h3>
              <div className="space-y-4">
                 <PinnedItem title="Holiday Calendar 2024" type="PDF" />
                 <PinnedItem title="Brand Style Guide v2" type="Doc" />
                 <PinnedItem title="Onboarding Checklist" type="Check" />
              </div>

              <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 transition-transform duration-700">
                    <BookOpen size={100} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Knowledge Tips</h4>
                 <p className="font-bold leading-relaxed text-sm mb-6">
                    Use **Markdown** shortcuts to quickly format your documentation. Press `Ctrl + /` to see the full list of shortcuts.
                 </p>
                 <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 transition-all">
                    View Shortcuts <ArrowUpRight size={14} />
                 </button>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}

function PinnedItem({ title, type }: { title: string, type: string }) {
   return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-100 transition-all">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black text-[10px] group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
               {type}
            </div>
            <span className="text-sm font-black text-slate-900">{title}</span>
         </div>
         <Star size={18} className="text-slate-200 fill-slate-200 group-hover:text-amber-400 group-hover:fill-amber-400 transition-all" />
      </div>
   );
}
