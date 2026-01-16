
import React, { useState } from 'react';
import { store } from '../store';
import { FBPost, FBPostType, FBPostStatus, ItemStatus, Motorcycle } from '../types';
import { Plus, Trash2, Check, RefreshCw, AlertCircle, Search, ExternalLink, AlertTriangle } from 'lucide-react';

const useStore = () => {
  const [state, setState] = React.useState(store);
  React.useEffect(() => {
    const unsub = store.subscribe(() => setState({ ...store }));
    return unsub;
  }, []);
  return state;
};

export const AdminLoginPage = ({ onLogin }: { onLogin: (r: boolean) => void }) => {
  const [pin, setPin] = useState('');
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '0000') onLogin(true); // Simple PIN for demo
    else alert('Invalid PIN');
  };
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
       <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
         <h2 className="text-white text-center font-black text-2xl mb-8 tracking-tighter">ACCESS CONTROL</h2>
         <input 
           type="password" 
           value={pin} 
           onChange={e => setPin(e.target.value)} 
           placeholder="ENTER PIN (0000)" 
           className="w-full bg-gray-800 text-white text-center text-2xl tracking-[0.5em] py-4 rounded-xl border border-gray-700 focus:border-red-500 focus:outline-none placeholder:text-gray-600 placeholder:text-sm placeholder:tracking-normal"
           autoFocus
         />
         <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-500 transition-colors">UNLOCK</button>
       </form>
    </div>
  );
};

export const AdminDashboard = () => {
  const { motos, fbPosts } = useStore();
  return (
    <div className="p-4">
       <h2 className="text-2xl font-black mb-6">NEXUS DASHBOARD</h2>
       <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total Stock</p>
             <p className="text-3xl font-black text-gray-900">{motos.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Pending Leads</p>
             <p className="text-3xl font-black text-blue-600">{fbPosts.filter(p => p.status === FBPostStatus.NEW).length}</p>
          </div>
       </div>
    </div>
  );
};

export const AdminFBSources = () => {
  const { fbPosts } = useStore();
  const [url, setUrl] = useState('');

  const handleAdd = () => {
     if (!url) return;
     store.addFBPost({
       id: 'fb-' + Date.now(),
       url,
       platform: 'facebook',
       type: FBPostType.MOTO,
       title_text: 'New Lead',
       price_estimate: 0,
       trust_score: 50,
       trust_level: 'medium' as any,
       status: FBPostStatus.NEW,
       curated_public: false,
       dateAdded: new Date().toLocaleDateString()
     });
     setUrl('');
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6 flex gap-2">
        <input 
          value={url} 
          onChange={e => setUrl(e.target.value)} 
          placeholder="Paste Facebook Link..." 
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded-xl"><Plus /></button>
      </div>

      <div className="space-y-4">
        {fbPosts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-2">
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${post.status === FBPostStatus.NEW ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                 {post.status}
               </span>
               <div className="flex gap-2">
                  <button onClick={() => store.evaluateFBPostWithAI(post.id)} className="text-blue-600 bg-blue-50 p-1.5 rounded-lg" title="AI Evaluate"><RefreshCw size={14} /></button>
                  <button onClick={() => store.importPostToMoto(post.id)} className="text-green-600 bg-green-50 p-1.5 rounded-lg" title="Import to Inventory"><Check size={14} /></button>
               </div>
             </div>
             <a href={post.url} target="_blank" className="font-bold text-sm text-gray-800 line-clamp-1 flex items-center gap-1 mb-1">
               {post.title_text || post.url} <ExternalLink size={10} className="text-gray-400" />
             </a>
             <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
               <span>Score: {post.trust_score}</span>
               <span className={`font-bold ${post.trust_level === 'high' ? 'text-green-500' : post.trust_level === 'low' ? 'text-red-500' : 'text-yellow-500'}`}>
                 {post.trust_level.toUpperCase()}
               </span>
             </div>
             {post.notes && <p className="text-xs bg-gray-50 p-2 rounded text-gray-600">{post.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminInventory = () => {
  const { motos } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  // simplified add form state
  const [newMoto, setNewMoto] = useState<Partial<Motorcycle>>({ title: '', price: 0 });

  const handleSave = () => {
    if (!newMoto.title) return;
    store.addMoto({
      id: 'm-' + Date.now(),
      slug: (newMoto.title || '').toLowerCase().replace(/\s/g, '-') + '-' + Date.now().toString().slice(-4),
      title: newMoto.title || '',
      price: newMoto.price || 0,
      brand: 'Honda',
      model: '',
      status: ItemStatus.AVAILABLE,
      documents: 'เล่ม',
      location_text: 'Shop',
      description: '',
      cover_photo_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
      photo_urls_json: [],
      source_type: 'manual',
      created_at: new Date().toISOString()
    } as Motorcycle);
    setIsAdding(false);
    setNewMoto({ title: '', price: 0 });
  };

  return (
    <div className="p-4 pb-20">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-black">INVENTORY CONTROL</h2>
         <button onClick={() => setIsAdding(!isAdding)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase">
           {isAdding ? 'Cancel' : 'Add Unit'}
         </button>
       </div>

       {isAdding && (
         <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
            <input 
              placeholder="Title / Model" 
              className="w-full p-2 rounded-lg border border-gray-300"
              value={newMoto.title} 
              onChange={e => setNewMoto({...newMoto, title: e.target.value})}
            />
            <input 
              type="number"
              placeholder="Price" 
              className="w-full p-2 rounded-lg border border-gray-300"
              value={newMoto.price || ''} 
              onChange={e => setNewMoto({...newMoto, price: Number(e.target.value)})}
            />
            <button onClick={handleSave} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg">SAVE UNIT</button>
         </div>
       )}

       <div className="space-y-3">
         {motos.map(moto => (
           <div key={moto.id} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
             <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
               <img src={moto.cover_photo_url} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-sm text-gray-900">{moto.title}</h3>
               <p className="text-red-600 font-black text-sm">฿{moto.price.toLocaleString()}</p>
               <div className="flex gap-2 mt-1">
                 <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{moto.status}</span>
               </div>
             </div>
             <button onClick={() => store.deleteMoto(moto.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
           </div>
         ))}
       </div>
    </div>
  );
};

export const AdminParts = () => (
  <div className="p-8 text-center text-gray-400">
    <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
    <p>Module Under Construction</p>
  </div>
);
