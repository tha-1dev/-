
import React, { useState } from 'react';
import { store } from '../store';
import { Customer, Product, RepairStatus, Sale } from '../types';
import { Search, ShoppingCart, User, Wrench, Save, Plus, Clock, CheckCircle, Package, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatWindow } from './ChatSystem';

const useStore = () => {
  const [state, setState] = React.useState(store);
  React.useEffect(() => {
    const unsub = store.subscribe(() => setState({ ...store }));
    return unsub;
  }, []);
  return state;
};

// --- CRM Module ---
export const CustomerManager = () => {
    const { customers } = useStore();
    const [search, setSearch] = useState('');
    const [isAdd, setIsAdd] = useState(false);
    const [newCus, setNewCus] = useState<Partial<Customer>>({});

    const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

    const handleSave = () => {
        if(!newCus.name) return;
        store.addCustomer(newCus);
        setIsAdd(false);
        setNewCus({});
    };

    return (
        <div className="p-4 pb-20 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black flex items-center gap-2"><User className="text-blue-600"/> CUSTOMER DATA</h2>
                <button onClick={() => setIsAdd(!isAdd)} className="bg-blue-600 text-white p-2 rounded-lg text-xs font-bold uppercase">{isAdd ? 'Cancel' : '+ New Customer'}</button>
            </div>

            {isAdd && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2 animate-in slide-in-from-top-2">
                    <input placeholder="Name" className="w-full p-2 rounded border" onChange={e => setNewCus({...newCus, name: e.target.value})} />
                    <input placeholder="Phone" className="w-full p-2 rounded border" onChange={e => setNewCus({...newCus, phone: e.target.value})} />
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white p-2 rounded font-bold">SAVE</button>
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-9 p-2 rounded-xl border border-gray-200 bg-white" />
            </div>

            <div className="space-y-2">
                {filtered.map(c => (
                    <div key={c.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                        <div>
                            <div className="font-bold text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.code} | {c.phone}</div>
                        </div>
                        <div className="flex gap-1">
                            {c.tags.map(t => <span key={t} className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600">{t}</span>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- POS Module ---
export const POSSystem = () => {
    const { products, customers } = useStore();
    const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');

    const addToCart = (p: Product) => {
        const exist = cart.find(i => i.product.id === p.id);
        if(exist) {
            setCart(cart.map(i => i.product.id === p.id ? {...i, qty: i.qty + 1} : i));
        } else {
            setCart([...cart, {product: p, qty: 1}]);
        }
    };

    const total = cart.reduce((sum, item) => sum + (item.product.sellPrice * item.qty), 0);

    const handleCheckout = () => {
        store.createSale(
            cart.map(i => ({productId: i.product.id, qty: i.qty})), 
            selectedCustomer || undefined, 
            'CASH', 
            'STAFF-CURRENT' // Mock staff
        );
        setCart([]);
        alert('Sale Complete!');
    };

    return (
        <div className="p-4 pb-24 h-screen flex flex-col">
            <h2 className="text-xl font-black flex items-center gap-2 mb-4"><ShoppingCart className="text-green-600"/> POINT OF SALE</h2>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-2">
                    {products.map(p => (
                        <button key={p.id} onClick={() => addToCart(p)} className="bg-white p-3 rounded-xl border border-gray-200 text-left hover:border-green-500 transition active:scale-95">
                            <div className="font-bold text-sm truncate">{p.name}</div>
                            <div className="flex justify-between items-end mt-1">
                                <span className="text-green-600 font-black">฿{p.sellPrice}</span>
                                <span className="text-[10px] text-gray-400">Stock: {p.stockQty}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border-t border-gray-200 p-4 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex-shrink-0 bg-gray-50 p-2 rounded-lg w-24 relative">
                             <div className="text-xs truncate font-bold">{item.product.name}</div>
                             <div className="text-xs text-gray-500">x{item.qty}</div>
                        </div>
                    ))}
                </div>
                
                <select className="w-full mb-3 p-2 border rounded-lg text-sm bg-gray-50" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                    <option value="">Walk-in Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500">Total</span>
                    <span className="text-2xl font-black text-green-600">฿{total.toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 disabled:opacity-50">
                    COMPLETE SALE
                </button>
            </div>
        </div>
    );
};

// --- Repair Module ---
export const RepairDashboard = () => {
    const { repairs, customers } = useStore();
    const [filter, setFilter] = useState('ALL');
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const navigate = useNavigate();

    return (
        <div className="p-4 pb-20">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black flex items-center gap-2"><Wrench className="text-orange-600"/> REPAIR CENTER</h2>
                <button className="bg-orange-600 text-white p-2 rounded-lg text-xs font-bold uppercase shadow-orange-200 shadow-md flex items-center gap-1">
                    <Plus size={14} /> New Job
                </button>
            </div>

            {selectedTicket ? (
                <div className="animate-in slide-in-from-right">
                    <button onClick={() => setSelectedTicket(null)} className="text-sm text-gray-500 mb-2">← Back</button>
                    <ChatWindow ticketId={selectedTicket} currentUser={{id: 'admin', role: 'ADMIN', name: 'Admin'}} />
                </div>
            ) : (
                <>
                    <div className="flex gap-2 overflow-x-auto mb-4 pb-1 no-scrollbar">
                        {['ALL', 'RECEIVED', 'CHECKING', 'WAITING_PARTS', 'DONE'].map(s => (
                            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${filter === s ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                {s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {repairs.filter(r => filter === 'ALL' || r.status === filter).map(ticket => {
                            const cus = customers.find(c => c.id === ticket.customerId);
                            return (
                                <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${ticket.status === 'DONE' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                    <div className="flex justify-between mb-1 pl-3">
                                        <span className="font-mono text-xs text-gray-400 font-bold">{ticket.ticketNo}</span>
                                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded uppercase">{ticket.status}</span>
                                    </div>
                                    <div className="pl-3">
                                        <h3 className="font-bold text-gray-900">{ticket.deviceType} - {ticket.brandModel}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{ticket.symptoms}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <User size={12}/> {cus?.name || 'Unknown'}
                                                <Clock size={12} className="ml-2"/> {new Date(ticket.createdAt).toLocaleDateString()}
                                            </div>
                                            <button 
                                                onClick={() => setSelectedTicket(ticket.id)}
                                                className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100 transition"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
