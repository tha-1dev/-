
import { 
  Motorcycle, Part, FBPost, ItemStatus, FBPostType, FBPostStatus, TrustLevel, ShopSettings,
  Customer, Product, RepairTicket, Sale, StockMovement, RepairStatus, SaleItem, SupportTicket,
  RepairLog
} from './types';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// --- Mock Data Generators ---
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', code: 'CUS-001', name: 'คุณสมชาย ใจดี', phone: '081-111-2222', tags: ['VIP'], createdAt: new Date().toISOString() },
  { id: 'c2', code: 'CUS-002', name: 'บริษัท ไอที โซลูชั่น', phone: '02-999-8888', tags: ['CORPORATE'], createdAt: new Date().toISOString() }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', sku: '8850001', name: 'SSD 250GB Samsung', category: 'Storage', costPrice: 800, sellPrice: 1200, stockQty: 10, minStockThreshold: 2, unit: 'box' },
  { id: 'p2', sku: '8850002', name: 'RAM 8GB DDR4 Kingston', category: 'Memory', costPrice: 600, sellPrice: 950, stockQty: 5, minStockThreshold: 2, unit: 'pcs' },
  { id: 'p3', sku: 'SERVICE-01', name: 'ค่าแรงตรวจเช็ค', category: 'Service', costPrice: 0, sellPrice: 300, stockQty: 9999, minStockThreshold: 0, unit: 'hr' }
];

const INITIAL_REPAIRS: RepairTicket[] = [
  { 
    id: 'r1', ticketNo: 'JOB-2401', customerId: 'c1', deviceType: 'Laptop', brandModel: 'Dell Inspiron', 
    symptoms: 'เปิดไม่ติด', depositAmount: 0, status: RepairStatus.CHECKING, 
    images: [], estimateCost: 1500, finalCost: 0, createdAt: new Date().toISOString() 
  }
];

const STORAGE_KEY = 'quantum_core_db_v2'; // Bump version to force refresh if needed

// --- Store Implementation ---

type Listener = () => void;
let listeners: Listener[] = [];
const emitChange = () => {
    listeners.forEach((l) => l());
    saveState();
};

const saveState = () => {
    try {
        const stateToSave = {
            motos: store.motos,
            fbPosts: store.fbPosts,
            customers: store.customers,
            products: store.products,
            repairs: store.repairs,
            sales: store.sales,
            stockMovements: store.stockMovements,
            supportTickets: store.supportTickets,
            settings: store.settings
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
        console.warn("Persistence Warning: Quota exceeded or storage disabled.");
    }
}

const loadState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw) {
            const data = JSON.parse(raw);
            // Validation: Ensure critical arrays exist
            if (!Array.isArray(data.motos)) data.motos = [];
            if (!Array.isArray(data.customers)) data.customers = INITIAL_CUSTOMERS;
            if (!Array.isArray(data.products)) data.products = INITIAL_PRODUCTS;
            if (!Array.isArray(data.repairs)) data.repairs = INITIAL_REPAIRS;
            return data;
        }
    } catch(e) {
        console.error("Critical: Failed to load persistence. Resetting to defaults.", e);
        localStorage.removeItem(STORAGE_KEY);
    }
    return null;
}

const persisted = loadState();

export const store = {
  // Use persisted data if available and valid, else defaults
  motos: (persisted?.motos || []) as Motorcycle[],
  fbPosts: (persisted?.fbPosts || []) as FBPost[],
  settings: (persisted?.settings || {
    shopName: 'อาคมคอมพิวเตอร์ Service Suite',
    phone: '084-9850985',
    lineId: '0917906788',
    address: 'ฝายกวาง อ.เชียงคำ จ.พะเยา',
  }) as ShopSettings,

  customers: (persisted?.customers || INITIAL_CUSTOMERS) as Customer[],
  products: (persisted?.products || INITIAL_PRODUCTS) as Product[],
  repairs: (persisted?.repairs || INITIAL_REPAIRS) as RepairTicket[],
  sales: (persisted?.sales || []) as Sale[],
  stockMovements: (persisted?.stockMovements || []) as StockMovement[],
  supportTickets: (persisted?.supportTickets || []) as SupportTicket[],

  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => { listeners = listeners.filter((l) => l !== listener); };
  },

  // --- Inventory Management Actions (Legacy & New) ---
  addMoto(moto: Motorcycle) {
    this.motos = [moto, ...this.motos];
    emitChange();
  },

  deleteMoto(id: string) {
    this.motos = this.motos.filter(m => m.id !== id);
    emitChange();
  },

  addFBPost(post: FBPost) {
    this.fbPosts = [post, ...this.fbPosts];
    emitChange();
  },

  async evaluateFBPostWithAI(postId: string) {
    const post = this.fbPosts.find(p => p.id === postId);
    if (!post) return;

    try {
      // Use process.env.GEMINI_API_KEY as fallback if API_KEY is missing
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
          console.warn("AI Aborted: No API Key found.");
          alert("Please set GEMINI_API_KEY in .env.local");
          return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Use supported model
        contents: {
            parts: [{ text: `Analyze this motorcycle sales lead. Title: "${post.title_text}", URL: ${post.url}. Provide market price (number), trust score (0-100), and short note.`}]
        },
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text; // Fixed property access
      const data = JSON.parse(text || '{}');
      
      if (data) {
        this.fbPosts = this.fbPosts.map(p => p.id === postId ? {
          ...p,
          price_estimate: data.price_estimate || data.price || 0,
          trust_score: data.trust_score || 50,
          trust_level: (data.trust_score > 75 ? TrustLevel.HIGH : data.trust_score > 40 ? TrustLevel.MEDIUM : TrustLevel.LOW),
          notes: data.notes || data.summary || '',
          status: FBPostStatus.CHECKED
        } : p);
        emitChange();
      }
    } catch (error) {
      console.error('AI Evaluation failed:', error);
      alert("AI Service Error: Check console logs.");
    }
  },

  importPostToMoto(postId: string) {
    const post = this.fbPosts.find(p => p.id === postId);
    if (!post) return;

    const newMoto: Motorcycle = {
      id: generateId('moto'),
      slug: `imported-${Date.now()}`,
      title: post.title_text,
      brand: 'Unknown',
      model: 'Unknown',
      price: post.price_estimate || 0,
      status: ItemStatus.AVAILABLE,
      documents: 'รอตรวจสอบ',
      location_text: post.location_text || 'Imported Source',
      description: `Imported from ${post.url}\n\nNotes: ${post.notes || ''}`,
      cover_photo_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
      photo_urls_json: [],
      source_type: 'facebook',
      source_fb_post_id: post.id,
      created_at: new Date().toISOString()
    };

    this.motos = [newMoto, ...this.motos];
    this.fbPosts = this.fbPosts.map(p => p.id === postId ? { ...p, status: FBPostStatus.IMPORTED, imported_motorcycle_id: newMoto.id } : p);
    emitChange();
  },

  // --- CRM Actions ---
  addCustomer(customer: Partial<Customer>) {
    const newCus: Customer = {
      id: generateId('cus'),
      code: `CUS-${String(this.customers.length + 1).padStart(3, '0')}`,
      name: customer.name || 'Unknown',
      phone: customer.phone || '',
      tags: customer.tags || [],
      createdAt: new Date().toISOString(),
      ...customer
    } as Customer;
    this.customers = [newCus, ...this.customers];
    emitChange();
    return newCus;
  },

  // --- Inventory Actions ---
  addProduct(product: Partial<Product>) {
    const newProd: Product = {
      id: generateId('prod'),
      sku: product.sku || 'SKU-NEW',
      name: product.name || 'New Product',
      stockQty: 0,
      minStockThreshold: 5,
      ...product
    } as Product;
    this.products = [newProd, ...this.products];
    emitChange();
  },

  adjustStock(productId: string, qty: number, type: 'IN' | 'OUT' | 'ADJUST', note: string, staffId: string) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const movement: StockMovement = {
      id: generateId('mov'),
      productId,
      type,
      qty,
      refType: 'AUDIT',
      date: new Date().toISOString(),
      staffId
    };
    this.stockMovements = [movement, ...this.stockMovements];

    const newQty = type === 'IN' ? product.stockQty + qty : (type === 'OUT' ? product.stockQty - qty : qty);
    this.products = this.products.map(p => p.id === productId ? { ...p, stockQty: newQty } : p);
    emitChange();
  },

  // --- POS / Sales Actions ---
  createSale(cartItems: {productId: string, qty: number}[], customerId: string | undefined, paymentMethod: 'CASH'|'TRANSFER', staffId: string) {
    const items: SaleItem[] = [];
    let totalAmount = 0;

    cartItems.forEach(item => {
      const product = this.products.find(p => p.id === item.productId);
      if (product) {
        const lineTotal = product.sellPrice * item.qty;
        items.push({
          productId: product.id,
          productName: product.name,
          qty: item.qty,
          pricePerUnit: product.sellPrice,
          discount: 0,
          total: lineTotal
        });
        totalAmount += lineTotal;

        if (product.category !== 'Service') {
           this.adjustStock(product.id, item.qty, 'OUT', 'POS Sale', staffId);
        }
      }
    });

    const sale: Sale = {
      id: generateId('sale'),
      invoiceNo: `INV-${new Date().getFullYear()}${new Date().getMonth()+1}-${String(this.sales.length + 1).padStart(4, '0')}`,
      customerId,
      staffId,
      items,
      totalAmount,
      discount: 0,
      vatRate: 0,
      netAmount: totalAmount,
      paymentMethod,
      date: new Date().toISOString()
    };

    this.sales = [sale, ...this.sales];
    emitChange();
    return sale;
  },

  // --- Repair Actions ---
  createRepairTicket(data: Partial<RepairTicket>) {
    const ticket: RepairTicket = {
      id: generateId('job'),
      ticketNo: `JOB-${new Date().getFullYear()}-${String(this.repairs.length + 1).padStart(3, '0')}`,
      status: RepairStatus.RECEIVED,
      depositAmount: 0,
      images: [],
      createdAt: new Date().toISOString(),
      estimateCost: 0,
      finalCost: 0,
      ...data
    } as RepairTicket;
    
    this.repairs = [ticket, ...this.repairs];
    this.addRepairLog(ticket.id, RepairStatus.RECEIVED, 'Job Created', 'SYSTEM');
    emitChange();
  },

  updateRepairStatus(ticketId: string, status: RepairStatus, note: string, staffId: string) {
    this.repairs = this.repairs.map(r => r.id === ticketId ? { ...r, status } : r);
    this.addRepairLog(ticketId, status, note, staffId);
    emitChange();
  },

  addRepairLog(repairId: string, status: RepairStatus, note: string, updatedBy: string) {
      console.log(`[Log] Repair ${repairId} -> ${status}: ${note}`);
      emitChange();
  }
};
