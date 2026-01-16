
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from './router';
import { Home, Bike, Facebook, Grid, AlertTriangle, RefreshCcw, Cpu, ShieldCheck, Database, Wifi, Users, ShoppingCart, Wrench, Monitor, Zap, Power } from 'lucide-react';

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="bg-red-500/10 p-4 rounded-full mb-4">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-xl font-black text-white uppercase mb-2 tracking-tighter">Core Critical Failure</h1>
          <p className="text-gray-400 text-xs mb-6">The Shadow Core has encountered an unrecoverable state.</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center bg-white text-black px-6 py-3 rounded-xl font-bold text-sm uppercase hover:bg-red-50">
            <RefreshCcw size={16} className="mr-2" /> Force Reboot (Clear Data)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Navigation Item ---
const NavItem = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link to={to} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${active ? 'text-red-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-none">{label}</span>
  </Link>
);

// --- Layout Wrapper ---
const AppLayout = ({ children, isAuth, handleLogout }: { children: React.ReactNode, isAuth: boolean, handleLogout: () => void }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    // Switch max-w based on route. Home gets full width, others get optimized container.
    <div className={`min-h-screen flex flex-col mx-auto bg-gray-50 shadow-2xl relative animate-in fade-in duration-500 ${isHomePage ? 'max-w-full' : 'max-w-7xl border-x border-gray-200'}`}>
      
      {/* Header / Navbar */}
      <nav className={`h-16 flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-300 ${isHomePage ? 'bg-red-600/95 backdrop-blur-md text-white shadow-none' : 'bg-white shadow-sm text-gray-900'}`}>
        <Link to="/" className="font-black text-xl flex items-center tracking-tighter gap-2 group">
            <div className={`p-1.5 rounded-lg ${isHomePage ? 'bg-white text-red-600' : 'bg-red-600 text-white'} group-hover:rotate-12 transition-transform`}>
                <Monitor size={20} />
            </div>
            <span>
                {isAdminPath && <span className="opacity-70 mr-2 text-sm px-2 py-0.5 border border-current rounded font-mono">CORE</span>}
                ARKHOM<span className="font-light">COMPUTER</span>
            </span>
        </Link>
        <div className="flex space-x-4 items-center">
             {/* Desktop Menu */}
             <div className="hidden md:flex gap-6 mr-4 font-bold text-sm tracking-widest">
                {!isAdminPath && (
                    <>
                        <Link to="/" className="hover:opacity-75">HOME</Link>
                        <Link to="/inventory" className="hover:opacity-75">SHOP</Link>
                        <Link to="/sources" className="hover:opacity-75">FEED</Link>
                    </>
                )}
             </div>

            {!isAuth ? (
                 <Link to="/admin/login" className={`text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest border transition-all ${isHomePage ? 'border-white/30 hover:bg-white hover:text-red-600' : 'border-gray-200 text-gray-500 hover:text-gray-900'}`}>
                    Login
                 </Link>
            ) : (
                 <button onClick={handleLogout} className="text-[10px] text-red-600 font-black px-4 py-2 bg-red-50 rounded border border-red-100 uppercase tracking-widest hover:bg-red-100">Exit</button>
            )}
        </div>
      </nav>

      <main className={`flex-1 relative z-0 ${!isHomePage && 'mb-20 md:mb-0'}`}>
        {children}
      </main>

      {/* Bottom Nav - Mobile Only */}
      <div className={`md:hidden bg-white border-t border-gray-200 h-16 flex justify-around items-center fixed bottom-0 w-full z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]`}>
        {!isAdminPath ? (
            <>
                <NavItem to="/" icon={<Home size={20} />} label="Home" active={location.pathname === '/'} />
                <NavItem to="/inventory" icon={<Bike size={20} />} label="Shop" active={location.pathname === '/inventory'} />
                <NavItem to="/sources" icon={<Facebook size={20} />} label="Feed" active={location.pathname === '/sources'} />
            </>
        ) : (
            <>
                <NavItem to="/admin" icon={<Grid size={20} />} label="Dash" active={location.pathname === '/admin'} />
                <NavItem to="/admin/crm" icon={<Users size={20} />} label="CRM" active={location.pathname === '/admin/crm'} />
                <NavItem to="/admin/pos" icon={<ShoppingCart size={20} />} label="POS" active={location.pathname === '/admin/pos'} />
                <NavItem to="/admin/repairs" icon={<Wrench size={20} />} label="Fix" active={location.pathname === '/admin/repairs'} />
            </>
        )}
      </div>
    </div>
  );
};

// --- Splash Screen (Arkhom Branded) ---
const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const duration = 2000; 
    const intervalTime = 20; 
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min((currentStep / totalSteps) * 100, 100);
      setProgress(percent);

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setTimeout(onFinish, 400); 
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center text-white p-8 overflow-hidden">
      {/* Background FX */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-orange-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-75"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-10 animate-ping"></div>
            <div className="bg-gradient-to-br from-red-600 to-orange-500 p-6 rounded-3xl shadow-2xl shadow-red-500/30 transform rotate-3 border border-white/10">
                <Monitor size={64} className="text-white drop-shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-white text-red-600 p-2 rounded-xl shadow-lg">
                    <Wrench size={24} />
                </div>
            </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            ARKHOM
        </h1>
        <p className="text-red-500 font-bold tracking-[0.3em] uppercase text-sm mb-12">Computer & Service</p>

        {/* Loading Bar */}
        <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden relative">
            <div 
                className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-75 ease-linear shadow-[0_0_15px_rgba(239,68,68,0.6)]" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        
        <div className="mt-4 flex gap-6 opacity-50">
             <Cpu size={16} className="animate-bounce" />
             <Zap size={16} className="animate-bounce delay-100" />
             <Power size={16} className="animate-bounce delay-200" />
        </div>
      </div>
      
      <div className="absolute bottom-6 text-[10px] text-gray-700 font-mono">
        © 2024 Arkhom Computer Chiang Kham. All systems go.
      </div>
    </div>
  );
};

// --- App Root ---
const AppContent = () => {
  const [isAuth, setIsAuth] = useState(() => {
    return !!(localStorage.getItem('add_service_token') || sessionStorage.getItem('add_service_token'));
  });

  const handleLogin = (remember: boolean) => {
    const token = 'at-' + Math.random().toString(36).substring(7);
    if (remember) {
      localStorage.setItem('add_service_token', token);
    } else {
      sessionStorage.setItem('add_service_token', token);
    }
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('add_service_token');
    sessionStorage.removeItem('add_service_token');
    setIsAuth(false);
  };

  return (
    <AppLayout isAuth={isAuth} handleLogout={handleLogout}>
      <AppRoutes onLogin={handleLogin} handleLogout={handleLogout} />
    </AppLayout>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);

  if (loading) return <SplashScreen onFinish={() => setLoading(false)} />;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
