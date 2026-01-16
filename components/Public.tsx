
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { store } from '../store';
import { MapPin, Phone, Facebook, Wrench, Monitor, Cctv, ShoppingBag, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

const useStore = () => {
  const [state, setState] = React.useState(store);
  React.useEffect(() => {
    const unsub = store.subscribe(() => setState({ ...store }));
    return unsub;
  }, []);
  return state;
};

export const HomePage = () => {
  const { settings } = useStore();
  
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* 70% Height Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 relative overflow-hidden flex items-center">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black opacity-10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        {/* Content Container */}
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 py-12">
            
            {/* Left Column: Text & CTA */}
            <div className="space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider border border-white/10 shadow-lg">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    เปิดให้บริการทุกวัน 8:30 - 17:30
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] drop-shadow-sm">
                    อาคมคอมพิวเตอร์<br/>
                    <span className="text-yellow-300">ศูนย์บริการไอทีครบวงจร</span><br/>
                    เชียงคำ
                </h1>
                
                <p className="text-red-50 text-lg md:text-xl font-medium max-w-lg mx-auto md:mx-0 leading-relaxed opacity-90">
                    จำหน่าย ซ่อม โน้ตบุ๊ค คอมพิวเตอร์ และบริการติดตั้งกล้องวงจรปิด โดยทีมช่างมืออาชีพ
                </p>

                <div className="flex flex-col md:flex-row gap-4 pt-4 justify-center md:justify-start">
                    <Link to="/inventory" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-black text-lg shadow-[0_10px_20px_rgba(250,204,21,0.3)] hover:bg-yellow-300 hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <ShoppingBag size={24} /> เช็คราคาสินค้า
                    </Link>
                    <a href={`tel:${settings.phone}`} className="bg-transparent border-2 border-cyan-200 text-cyan-100 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 hover:text-white hover:border-white transition-all flex items-center justify-center gap-2">
                        <Phone size={24} /> ติดต่อเรา ({settings.phone})
                    </a>
                </div>
            </div>

            {/* Right Column: Hero Image Composition */}
            <div className="hidden md:block relative">
                <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
                    <img 
                        src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80" 
                        alt="Computer Setup" 
                        className="rounded-3xl shadow-2xl border-4 border-white/10 w-full object-cover h-[400px]"
                    />
                    {/* Floating Badge CCTV */}
                    <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                        <div className="bg-red-100 p-3 rounded-xl text-red-600">
                            <Cctv size={32} />
                        </div>
                        <div>
                            <div className="font-black text-gray-800">CCTV Expert</div>
                            <div className="text-xs text-gray-500">Installation & Service</div>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements behind image */}
                <div className="absolute -top-10 -right-10 w-full h-full border-2 border-yellow-400/30 rounded-3xl z-0"></div>
            </div>
        </div>
      </div>

      {/* 30% Height (Approx) Service Strip */}
      <div className="bg-white py-12 border-t border-gray-100">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Service 1 */}
                <Link to="/repairs" className="group bg-gray-50 hover:bg-red-50 p-8 rounded-3xl transition-colors text-center md:text-left">
                    <div className="inline-block bg-white p-4 rounded-2xl shadow-sm text-red-600 mb-4 group-hover:scale-110 transition-transform">
                        <Wrench size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">บริการซ่อมคอมพิวเตอร์</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        ตรวจเช็คอาการฟรี ซ่อมด่วน รอรับได้ อะไหล่แท้ รับประกันงานซ่อมทุกอาการ
                    </p>
                </Link>

                {/* Service 2 */}
                <Link to="/inventory" className="group bg-gray-50 hover:bg-orange-50 p-8 rounded-3xl transition-colors text-center md:text-left">
                    <div className="inline-block bg-white p-4 rounded-2xl shadow-sm text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                        <Monitor size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">จำหน่ายสินค้าไอที</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        โน้ตบุ๊ค คอมพิวเตอร์ประกอบ อุปกรณ์เสริม ปริ้นเตอร์ หมึก และแกดเจ็ตครบวงจร
                    </p>
                </Link>

                {/* Service 3 */}
                <Link to="/cctv" className="group bg-gray-50 hover:bg-blue-50 p-8 rounded-3xl transition-colors text-center md:text-left">
                    <div className="inline-block bg-white p-4 rounded-2xl shadow-sm text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">กล้องวงจรปิด CCTV</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        รับติดตั้งกล้องวงจรปิด ดูผ่านมือถือได้ทั่วโลก ภาพคมชัด บริการหลังการขายเป็นกันเอง
                    </p>
                </Link>

            </div>
         </div>
      </div>
    </div>
  );
};

export const InventoryPage = () => {
  const { motos } = useStore();
  return (
    <div className="container mx-auto p-4 md:p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-black flex items-center">
            <span className="bg-red-600 w-3 h-8 mr-3 rounded-sm"></span>
            INVENTORY
          </h2>
          <div className="text-sm text-gray-500 font-bold">{motos.length} ITEMS AVAILABLE</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {motos.map(moto => (
          <Link key={moto.id} to={`/motorcycles/${moto.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
               <img src={moto.cover_photo_url} alt={moto.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-wide">
                 {moto.status}
               </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg leading-tight mb-2 text-gray-900 group-hover:text-red-600 transition-colors">{moto.title}</h3>
              <p className="text-red-600 font-black text-2xl mb-4">฿{moto.price.toLocaleString()}</p>
              <div className="flex items-center text-gray-400 text-xs space-x-3 pt-3 border-t border-gray-50">
                 <span className="flex items-center gap-1"><Cpu size={14}/> {moto.brand}</span>
                 <span>•</span>
                 <span className="flex items-center gap-1"><MapPin size={14}/> {moto.location_text}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const PublicSourcesPage = () => {
  const { fbPosts } = useStore();
  const publicPosts = fbPosts.filter(p => p.curated_public);

  return (
    <div className="container mx-auto p-4 md:p-8 pb-20">
      <h2 className="text-2xl md:text-3xl font-black mb-8 flex items-center"><span className="bg-blue-600 w-3 h-8 mr-3 rounded-sm"></span>COMMUNITY FEED</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {publicPosts.map(post => (
           <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
             <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wide">{post.type}</span>
                <span className="text-gray-400 text-xs">{post.dateAdded}</span>
             </div>
             <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{post.title_text}</h3>
             <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{post.notes}</p>
             <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="font-black text-gray-900 text-lg">฿{post.price_estimate?.toLocaleString()}</span>
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                    VISIT POST <Facebook size={16} />
                </div>
             </div>
           </a>
         ))}
      </div>
    </div>
  );
};

export const MotoDetailPage = () => {
  const { slug } = useParams();
  const { motos, settings } = useStore();
  const moto = motos.find(m => m.slug === slug);

  if (!moto) return <div className="p-12 text-center text-gray-400 font-bold text-xl">Item not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto bg-white shadow-xl overflow-hidden md:rounded-b-3xl">
          <div className="aspect-video md:aspect-[21/9] bg-gray-100 relative">
            <img src={moto.cover_photo_url} alt={moto.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
                <div className="text-sm font-bold bg-red-600 inline-block px-3 py-1 rounded mb-2 shadow-lg">{moto.status}</div>
                <h1 className="text-3xl md:text-4xl font-black shadow-black drop-shadow-lg">{moto.title}</h1>
            </div>
          </div>
          
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8">
                <div>
                    <h3 className="text-gray-900 font-black text-xl mb-4 flex items-center gap-2">
                        <Monitor className="text-gray-400"/> DESCRIPTION
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        {moto.description || 'No description provided.'}
                    </p>
                </div>
                
                <div>
                    <h3 className="text-gray-900 font-black text-xl mb-4 flex items-center gap-2">
                        <Wrench className="text-gray-400"/> SPECIFICATIONS
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 p-4 rounded-xl">
                            <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Brand</span>
                            <span className="font-bold text-gray-900">{moto.brand}</span>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-xl">
                             <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Model</span>
                             <span className="font-bold text-gray-900">{moto.model}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:col-span-1 space-y-6">
                 <div className="bg-white border-2 border-red-100 p-6 rounded-3xl shadow-lg text-center">
                    <span className="text-gray-400 text-sm font-bold uppercase">Price</span>
                    <div className="text-4xl font-black text-red-600 my-2">฿{moto.price.toLocaleString()}</div>
                    <div className="text-xs text-green-600 font-bold bg-green-50 inline-block px-3 py-1 rounded-full">Available Now</div>
                 </div>

                 <div className="space-y-3">
                     <a href={`tel:${settings.phone}`} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg">
                       <Phone size={20} /> Call Now
                     </a>
                     <a href={settings.mapUrl || '#'} target="_blank" className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-red-600 hover:text-red-600 transition-colors">
                       <MapPin size={20} /> Location
                     </a>
                 </div>

                 <div className="bg-blue-50 p-6 rounded-2xl text-center">
                    <p className="text-blue-800 font-bold text-sm mb-1">Financing Available</p>
                    <p className="text-blue-600 text-xs">Contact us for installment plans.</p>
                 </div>
            </div>
          </div>
      </div>
    </div>
  );
};
