
export enum ItemStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
}

export enum FBPostType {
  MOTO = 'moto',
  PARTS = 'parts',
  WANTED = 'wanted',
  EXCHANGE = 'exchange',
}

export enum FBPostStatus {
  NEW = 'new',
  CHECKED = 'checked',
  IMPORTED = 'imported',
  IGNORED = 'ignored',
}

export enum TrustLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// --- Legacy / Existing Types ---

export interface Motorcycle {
  id: string;
  slug: string;
  title: string;
  brand: string; // Honda, Yamaha
  model: string; // Wave 110i
  year?: string;
  cc?: number;
  mileage_km?: number;
  price: number;
  status: ItemStatus;
  documents: string; // เล่ม/โอน
  location_text: string;
  description: string;
  cover_photo_url: string;
  photo_urls_json: string[]; // Additional photos
  source_type: 'manual' | 'facebook';
  source_fb_post_id?: string;
  created_at: string;
}

export interface Part {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  condition: 'new' | 'used' | 'refurb';
  description: string;
  cover_photo_url: string;
}

export interface FBPost {
  id: string;
  url: string;
  platform: 'facebook';
  type: FBPostType;
  title_text: string; // Curated title
  price_text?: string;
  price_estimate?: number;
  location_text?: string;
  seller_name?: string;
  phone_text?: string;
  notes?: string;
  trust_score: number; // 0-100
  trust_level: TrustLevel;
  status: FBPostStatus;
  curated_public: boolean; // Show on public source page?
  imported_motorcycle_id?: string;
  dateAdded: string;
}

export interface SearchAgentConfig {
  province: string;
  district: string;
  subDistrict: string;
  keyword: string;
  minPrice: string;
  maxPrice: string;
}

export interface ShopSettings {
  shopName: string;
  phone: string;
  lineId: string;
  facebookUrl?: string; // Made optional to prevent strict type errors
  mapUrl?: string;      // Made optional
  address: string;
}

export interface FileAsset {
    id: string;
    kind: 'IMAGE' | 'DOCUMENT';
    mimeType: string;
    filename: string;
    sizeBytes: number;
    url: string;
}

export interface UserProfile {
    id: string;
    role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
    name: string;
    avatarUrl?: string;
}

export interface Message {
    id: string;
    ticketId: string; // Links to SupportTicket.id
    senderType: 'STAFF' | 'CUSTOMER';
    senderId: string;
    body: string;
    assets: FileAsset[];
    createdAt: Date;
    isRead: boolean;
}

// --- New Domain Modules (Database Structure) ---

// A) CRM / Customers
export interface Customer {
  id: string;
  code: string; // CUS-xxxx
  name: string;
  phone: string;
  lineId?: string;
  address?: string;
  notes?: string;
  tags: string[]; // VIP, Corporate, etc.
  createdAt: string;
}

// B) Inventory / Products / Stock
export interface Product {
  id: string;
  sku: string; // Barcode
  name: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  stockQty: number;
  minStockThreshold: number;
  unit: string; // pcs, box
  coverPhotoUrl?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  qty: number;
  refType: 'SALE' | 'REPAIR' | 'PURCHASE' | 'AUDIT';
  refId?: string;
  date: string;
  staffId: string;
}

// C) POS / Sales / Payments
export interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string; // Optional for walk-in
  staffId: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  vatRate: number; // 0 or 7%
  netAmount: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'QR';
  paymentSlipUrl?: string;
  date: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  pricePerUnit: number;
  discount: number;
  total: number;
}

// D) Repair Ticketing
export enum RepairStatus {
  RECEIVED = 'RECEIVED',
  CHECKING = 'CHECKING',
  QUOTATION = 'QUOTATION',
  WAITING_PARTS = 'WAITING_PARTS',
  REPAIRING = 'REPAIRING',
  DONE = 'DONE',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface RepairTicket {
  id: string;
  ticketNo: string; // JOB-xxxx
  customerId: string;
  deviceType: string;
  brandModel: string;
  serialNo?: string;
  symptoms: string;
  depositAmount: number;
  status: RepairStatus;
  images: FileAsset[]; // Before/After photos
  estimateCost: number;
  finalCost: number;
  technicianId?: string;
  createdAt: string;
  finishedAt?: string;
}

export interface RepairLog {
  id: string;
  repairId: string;
  status: RepairStatus;
  note: string;
  updatedBy: string; // staffId
  timestamp: string;
}

// E) CCTV / On-site Projects
export interface CctvProject {
  id: string;
  name: string;
  customerId: string;
  location: string;
  status: 'PROSPECT' | 'QUOTATION' | 'INSTALLING' | 'COMPLETED' | 'MAINTENANCE';
  quotationUrl?: string;
  installDate?: string;
  warrantyExpireDate?: string;
}

export interface CctvVisit {
  id: string;
  projectId: string;
  type: 'SURVEY' | 'INSTALL' | 'SERVICE';
  date: string;
  staffIds: string[];
  checkInLocation?: { lat: number, lng: number };
  checkInPhotoUrl?: string;
  workDone: string;
  images: FileAsset[];
}

// F) Support Desk
export interface SupportTicket {
  id: string;
  ticketNo: string; // SUP-xxxx
  customerId: string;
  title: string;
  category: 'REPAIR' | 'VIRUS' | 'SOFTWARE' | 'CCTV' | 'NETWORK' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string; // staffId
  createdAt: string;
  updatedAt: string;
}

export interface SupportPortalToken {
  token: string;
  customerId: string;
  ticketId?: string; // Optional: Scope to specific ticket
  expiresAt: string;
}

// G) Remote Support
export interface RemoteSession {
  id: string;
  customerId: string;
  code: string; // One-time token
  tool: 'TEAMVIEWER' | 'ANYDESK' | 'CHROME_REMOTE';
  staffId: string;
  startTime: string;
  endTime?: string;
  consentTimestamp: string;
  auditLog: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  changes: string; // JSON diff
  timestamp: string;
}
