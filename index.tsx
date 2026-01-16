
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  MessageSquare, Wrench, Shield, Search, FileText, Send, 
  Paperclip, User, CheckCircle, Clock, XCircle, AlertCircle,
  ChevronRight, Smartphone, LogOut, LayoutDashboard, Plus,
  Image as ImageIcon, Film, Download, File, X, MonitorPlay, 
  Copy, ExternalLink, Key, Check, CheckCheck
} from 'lucide-react';

// --- Types & Interfaces (Aligned with Prisma Schema) ---

type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

// Enum: TicketCategory
type TicketCategory = 
  | 'REPAIR_PC' 
  | 'REPAIR_NOTEBOOK' 
  | 'VIRUS' 
  | 'SOFTWARE_INSTALL' 
  | 'CCTV' 
  | 'NETWORK' 
  | 'OTHER';

// Enum: TicketStatus
type TicketStatus = 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'WAITING_CUSTOMER' 
  | 'RESOLVED' 
  | 'CLOSED';

// Enum: MessageSenderType
type MessageSenderType = 'STAFF' | 'CUSTOMER' | 'SYSTEM';

// Enum: AssetKind
type AssetKind = 'IMAGE' | 'DOCUMENT' | 'SLIP' | 'OTHER';

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

interface FileAsset {
  id: string;
  kind: AssetKind;
  mimeType: string;
  filename: string;
  sizeBytes: number;
  url: string;
}

interface Message {
  id: string;
  ticketId: string;
  senderType: MessageSenderType;
  senderId?: string; // Nullable in schema
  customerName?: string; // For portal
  body: string;
  assets: FileAsset[];
  createdAt: Date;
  
  // UI State (not in DB)
  isRead: boolean; 
}

interface Ticket {
  id: string;
  code: string; // "AK-2026-000123"
  category: TicketCategory;
  status: TicketStatus;
  subject: string;
  description?: string;
  priority: number; // 1 high, 2 normal, 3 low
  
  customerId: string;
  customerName: string;
  assignee?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface RepairJob {
  id: string;
  ticketNumber: string; // e.g., R2405-001
  device: string;
  problem: string;
  status: 'RECEIVED' | 'CHECKING' | 'WAITING_PARTS' | 'REPAIRING' | 'DONE' | 'DELIVERED';
  cost: number;
  deposit: number;
  timeline: { status: string; date: Date; note?: string }[];
  images: string[];
  linkedTicketId?: string; // Links repair job to chat ticket
}

interface RemoteSession {
  id: string;
  customerId: string;
  customerName: string;
  accessCode: string;
  status: 'WAITING' | 'CONNECTED' | 'COMPLETED';
  timestamp: Date;
}

// --- Mock Data ---

const ADMIN_USER: UserProfile = {
  id: 'u1',
  name: 'Somchai (Admin)',
  role: 'ADMIN',
  avatar: 'https://ui-avatars.com/api/?name=Somchai&background=0D8ABC&color=fff'
};

const CUSTOMER_USER: UserProfile = {
  id: 'c1',
  name: 'คุณสมศักดิ์ (Customer)',
  role: 'CUSTOMER',
  avatar: 'https://ui-avatars.com/api/?name=Somsak&background=random'
};

const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    code: 'AK-2024-001',
    subject: 'Notebook เปิดไม่ติด ไฟเข้าแต่จอดำ',
    category: 'REPAIR_NOTEBOOK',
    status: 'IN_PROGRESS',
    description: 'ไฟเข้าครับ แต่หน้าจอไม่ติดเลย ลองกดปุ่มเปิดค้างไว้แล้วก็เหมือนเดิม',
    priority: 1,
    customerId: 'c1',
    customerName: 'คุณสมศักดิ์',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    assignee: 'ช่างเอก'
  },
  {
    id: 't2',
    code: 'AK-2024-002',
    subject: 'ปรึกษาติดตั้งกล้องวงจรปิด 4 จุด',
    category: 'CCTV',
    status: 'OPEN',
    description: 'ต้องการติดกล้องหน้าร้านและในร้าน',
    priority: 2,
    customerId: 'c2',
    customerName: 'ร้านกาแฟป้าน้อย',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 't3',
    code: 'AK-2024-003',
    subject: 'ลง Windows ใหม่',
    category: 'SOFTWARE_INSTALL',
    status: 'WAITING_CUSTOMER',
    priority: 2,
    customerId: 'c3',
    customerName: 'น้องมายด์',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    assignee: 'ช่างเอก'
  }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  't1': [
    { 
      id: 'm1', ticketId: 't1', senderType: 'CUSTOMER', senderId: 'c1', 
      body: 'สวัสดีครับ สอบถามเรื่อง Notebook ครับ', 
      assets: [], 
      createdAt: new Date(Date.now() - 3600000), isRead: true 
    },
    { 
      id: 'm2', ticketId: 't1', senderType: 'STAFF', senderId: 'u1', 
      body: 'สวัสดีครับ อาคมคอมพิวเตอร์ยินดีให้บริการครับ เครื่องมีอาการอย่างไรครับ?', 
      assets: [], 
      createdAt: new Date(Date.now() - 3500000), isRead: true 
    },
    { 
      id: 'm3', ticketId: 't1', senderType: 'CUSTOMER', senderId: 'c1', 
      body: 'ไฟเข้าครับ แต่หน้าจอไม่ติดเลย ลองกดปุ่มเปิดค้างไว้แล้วก็เหมือนเดิม', 
      assets: [], 
      createdAt: new Date(Date.now() - 3400000), isRead: true 
    },
    { 
      id: 'm5', ticketId: 't1', senderType: 'CUSTOMER', senderId: 'c1', 
      body: 'ส่งรูปภาพ', 
      assets: [
        { 
          id: 'a1', kind: 'IMAGE', mimeType: 'image/jpeg', filename: 'screen_error.jpg', sizeBytes: 1200000, 
          url: 'https://images.unsplash.com/photo-1588872657578-a3d2af1a2943?auto=format&fit=crop&q=80&w=600' 
        }
      ], 
      createdAt: new Date(Date.now() - 3350000), isRead: true 
    },
    { 
      id: 'm4', ticketId: 't1', senderType: 'STAFF', senderId: 'u1', 
      body: 'รับทราบครับ เบื้องต้นอาจจะเป็นที่ Ram หรือ Chip การ์ดจอครับ สะดวกนำเครื่องเข้ามาเช็คที่ร้านไหมครับ?', 
      assets: [], 
      createdAt: new Date(Date.now() - 3300000), isRead: true 
    },
    { 
      id: 'm6', ticketId: 't1', senderType: 'STAFF', senderId: 'u1', 
      body: 'แนบใบเสนอราคาครับ', 
      assets: [
        { 
          id: 'a2', kind: 'DOCUMENT', mimeType: 'application/pdf', filename: 'ใบเสนอราคา_ซ่อม.pdf', sizeBytes: 245000, 
          url: '#' 
        }
      ], 
      createdAt: new Date(Date.now() - 3200000), isRead: true 
    },
  ],
  't2': [],
  't3': []
};

const MOCK_REPAIRS: RepairJob[] = [
  {
    id: 'r1',
    ticketNumber: 'R2405-001',
    device: 'Acer Nitro 5',
    problem: 'เปิดไม่ติด/จอดำ',
    status: 'WAITING_PARTS',
    cost: 2500,
    deposit: 500,
    images: ['https://placehold.co/600x400/png?text=Broken+Laptop', 'https://placehold.co/600x400/png?text=Mainboard'],
    timeline: [
      { status: 'รับเครื่องเข้าระบบ', date: new Date('2024-05-20T10:00:00'), note: 'สภาพภายนอกปกติ ไม่มีรอยตกกระแทก' },
      { status: 'ตรวจเช็คอาการ', date: new Date('2024-05-20T14:30:00'), note: 'พบ Mainboard ช็อตภาคจ่ายไฟ' },
      { status: 'รออะไหล่', date: new Date('2024-05-21T09:00:00'), note: 'สั่งอะไหล่จากศูนย์ รอ 3-5 วัน' }
    ],
    linkedTicketId: 't1'
  }
];

const MOCK_REMOTE_SESSIONS: RemoteSession[] = [
  { id: 'rs1', customerId: 'c2', customerName: 'ร้านกาแฟป้าน้อย', accessCode: '3948 1029 4857', status: 'WAITING', timestamp: new Date(Date.now() - 1000 * 60 * 5) }
];

const QUICK_REPLIES = [
  "ขอทราบ Serial Number ของเครื่องด้วยครับ",
  "รบกวนถ่ายรูปอาการเสียส่งให้หน่อยครับ",
  "สะดวกนำเครื่องเข้ามาให้ช่างตรวจสอบไหมครับ?",
  "ขออนุญาตปิดเคสนะครับ หากมีปัญหาเพิ่มเติมแจ้งได้เลยครับ",
  "ค่าบริการประเมินเบื้องต้นอยู่ที่ 300 บาทครับ"
];

// --- Components ---

const StatusBadge = ({ status }: { status: TicketStatus | RepairJob['status'] }) => {
  const colors = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    WAITING_CUSTOMER: 'bg-orange-100 text-orange-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    // Repair Status
    RECEIVED: 'bg-blue-100 text-blue-800',
    CHECKING: 'bg-purple-100 text-purple-800',
    WAITING_PARTS: 'bg-orange-100 text-orange-800',
    REPAIRING: 'bg-yellow-100 text-yellow-800',
    DONE: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const CreateTicketModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (t: any) => void }) => {
  const categories: TicketCategory[] = ['REPAIR_PC', 'REPAIR_NOTEBOOK', 'VIRUS', 'SOFTWARE_INSTALL', 'CCTV', 'NETWORK', 'OTHER'];
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('REPAIR_PC');
  const [desc, setDesc] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold mb-4 text-gray-800">แจ้งปัญหาใหม่ (Open Ticket)</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ subject, category, desc }); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อปัญหา</label>
              <input 
                required 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                placeholder="เช่น เปิดไม่ติด, อินเทอร์เน็ตหลุด" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่บริการ</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white" 
                value={category} 
                onChange={e => setCategory(e.target.value as TicketCategory)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเบื้องต้น</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2.5 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                placeholder="อธิบายอาการเสีย หรือสิ่งที่ต้องการปรึกษา..."
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition">ยกเลิก</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition">ส่งข้อมูล</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChatWindow = ({ ticketId, currentUser }: { ticketId: string, currentUser: UserProfile }) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[ticketId] || []);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState<{name: string, progress: number} | null>(null);

  // Image Lightbox State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const currentMsgs = MOCK_MESSAGES[ticketId] || [];
    
    // Mark messages from other user as read when entering
    // Determine "other user" based on role vs message senderType
    const hasUnread = currentMsgs.some(m => {
        if (currentUser.role === 'CUSTOMER') {
            return m.senderType === 'STAFF' && !m.isRead;
        } else {
            return m.senderType === 'CUSTOMER' && !m.isRead;
        }
    });

    if (hasUnread) {
        const updated = currentMsgs.map(m => {
            const isMe = (currentUser.role === 'CUSTOMER' && m.senderType === 'CUSTOMER') || 
                         (currentUser.role !== 'CUSTOMER' && m.senderType === 'STAFF');
            return !isMe ? {...m, isRead: true} : m;
        });
        MOCK_MESSAGES[ticketId] = updated;
        setMessages(updated);
    } else {
        setMessages(currentMsgs);
    }
    
    scrollToBottom();
  }, [ticketId, currentUser.id, currentUser.role]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, uploadingFile]); // Also scroll when upload status changes

  const handleSend = (text: string = inputText) => {
    if (!text.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      ticketId: ticketId,
      senderType: currentUser.role === 'CUSTOMER' ? 'CUSTOMER' : 'STAFF',
      senderId: currentUser.id,
      body: text,
      assets: [],
      createdAt: new Date(),
      isRead: false
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');
    
    if (!MOCK_MESSAGES[ticketId]) MOCK_MESSAGES[ticketId] = [];
    MOCK_MESSAGES[ticketId].push(newMessage);

    // Simulate other party reading the message
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, isRead: true } : m));
        const msgInMock = MOCK_MESSAGES[ticketId].find(m => m.id === newMessage.id);
        if (msgInMock) msgInMock.isRead = true;
    }, 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = '';

    setUploadingFile({ name: file.name, progress: 0 });
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 20; 
        setUploadingFile({ name: file.name, progress });
        
        if (progress >= 100) {
            clearInterval(interval);
            
            let kind: AssetKind = 'OTHER';
            if (file.type.startsWith('image/')) kind = 'IMAGE';
            else if (file.type.includes('pdf') || file.type.includes('doc')) kind = 'DOCUMENT';
            
            const mockUrl = URL.createObjectURL(file);
            
            const newMessage: Message = {
                id: Date.now().toString(),
                ticketId: ticketId,
                senderType: currentUser.role === 'CUSTOMER' ? 'CUSTOMER' : 'STAFF',
                senderId: currentUser.id,
                body: kind === 'IMAGE' ? 'ส่งรูปภาพ' : `ส่งไฟล์: ${file.name}`,
                createdAt: new Date(),
                isRead: false,
                assets: [{
                    id: `a${Date.now()}`,
                    kind,
                    mimeType: file.type,
                    filename: file.name,
                    sizeBytes: file.size,
                    url: mockUrl
                }]
            };

            setMessages(prev => [...prev, newMessage]);
            if (!MOCK_MESSAGES[ticketId]) MOCK_MESSAGES[ticketId] = [];
            MOCK_MESSAGES[ticketId].push(newMessage);
            
            setTimeout(() => {
                setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, isRead: true } : m));
                const msgInMock = MOCK_MESSAGES[ticketId].find(m => m.id === newMessage.id);
                if (msgInMock) msgInMock.isRead = true;
            }, 3000);

            setUploadingFile(null); 
        }
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelect}
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
      />

      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition">
                <X className="w-8 h-8" />
            </button>
            <img 
              src={selectedImage} 
              alt="Full Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>เริ่มการสนทนาได้เลย</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${isMe ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}>
                  
                  {/* Text Body */}
                  {msg.body && <p className="text-sm">{msg.body}</p>}

                  {/* Assets */}
                  {msg.assets && msg.assets.length > 0 && (
                      <div className={`mt-2 space-y-2 ${!msg.body ? 'mt-0' : ''}`}>
                          {msg.assets.map(asset => {
                              if (asset.kind === 'IMAGE') {
                                  return (
                                    <div key={asset.id} className="group relative">
                                        <img 
                                            src={asset.url} 
                                            alt={asset.filename}
                                            onClick={() => setSelectedImage(asset.url)}
                                            className="rounded-lg max-w-full max-h-64 object-cover border border-white/20 cursor-zoom-in hover:brightness-95 transition shadow-sm" 
                                        />
                                    </div>
                                  );
                              } else {
                                  return (
                                    <div key={asset.id} className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-indigo-500/20' : 'bg-gray-50'} border ${isMe ? 'border-indigo-400/30' : 'border-gray-200'} transition hover:shadow-sm`}>
                                        <div className={`p-2.5 rounded-lg ${isMe ? 'bg-indigo-700' : 'bg-white shadow-sm border border-gray-100'}`}>
                                            <File className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="text-sm font-medium truncate">{asset.filename}</p>
                                            <p className={`text-xs ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                {(asset.sizeBytes / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <a 
                                            href={asset.url} 
                                            download={asset.filename} 
                                            className={`p-2 rounded-full hover:bg-black/10 transition ${isMe ? 'text-white' : 'text-gray-600'}`}
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                  );
                              }
                          })}
                      </div>
                  )}

                  <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                    <span>{msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      <span className="flex items-center gap-0.5" title={msg.isRead ? "อ่านแล้ว (Read)" : "ส่งแล้ว (Sent)"}>
                        {msg.isRead ? (
                          <>Read <CheckCheck className="w-3 h-3 text-green-300" /></>
                        ) : (
                          <>Sent <Check className="w-3 h-3 text-indigo-200" /></>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Upload Progress Indicator */}
      {uploadingFile && (
        <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100">
           <div className="flex justify-between text-xs text-indigo-700 mb-1 font-medium">
               <span className="flex items-center gap-1"><Paperclip className="w-3 h-3"/> กำลังอัปโหลด: {uploadingFile.name}</span>
               <span>{uploadingFile.progress}%</span>
           </div>
           <div className="w-full bg-indigo-200 rounded-full h-1.5">
               <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadingFile.progress}%` }}></div>
           </div>
        </div>
      )}

      {/* Quick Replies (Staff Only) */}
      {currentUser.role === 'ADMIN' && !uploadingFile && (
        <div className="px-4 py-2 bg-gray-100 flex gap-2 overflow-x-auto border-t border-gray-200">
          {QUICK_REPLIES.map((reply, idx) => (
            <button 
              key={idx}
              onClick={() => setInputText(reply)}
              className="whitespace-nowrap px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-50 hover:border-indigo-500 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={!!uploadingFile}
          className={`p-2 rounded-full transition ${!!uploadingFile ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          title="แนบรูปภาพหรือไฟล์"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="พิมพ์ข้อความ..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!!uploadingFile}
        />
        <button 
          onClick={() => handleSend()}
          disabled={!inputText.trim() || !!uploadingFile}
          className={`p-2 text-white rounded-full transition shadow-sm ${!inputText.trim() || !!uploadingFile ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- Remote Support Component ---

const RemoteSupport = ({ currentUser }: { currentUser: UserProfile }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessions, setSessions] = useState<RemoteSession[]>(MOCK_REMOTE_SESSIONS);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    
    setIsSubmitted(true);
    // Simulate adding session
    if (currentUser.role === 'CUSTOMER') {
      const newSession: RemoteSession = {
        id: `rs${Date.now()}`,
        customerId: currentUser.id,
        customerName: currentUser.name,
        accessCode: accessCode,
        status: 'WAITING',
        timestamp: new Date()
      };
      // In a real app this would sync to backend
      console.log("New Remote Session:", newSession);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
    alert(`Copied: ${text}`);
  };

  // --- ADMIN VIEW ---
  if (currentUser.role === 'ADMIN') {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MonitorPlay className="w-8 h-8 text-indigo-600" /> Remote Support Dashboard
            </h2>
            <p className="text-gray-500">จัดการการเชื่อมต่อระยะไกล (Chrome Remote Desktop)</p>
          </div>
          <button 
             onClick={() => window.open('https://remotedesktop.google.com/support', '_blank')}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
          >
             <ExternalLink className="w-4 h-4" /> Connect to Customer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {sessions.map(session => (
             <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${session.status === 'WAITING' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {session.customerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{session.customerName}</h3>
                        <p className="text-xs text-gray-500">{session.timestamp.toLocaleTimeString()}</p>
                      </div>
                   </div>
                   <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Active</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Access Code:</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-mono font-bold tracking-wider text-gray-800">{session.accessCode}</span>
                    <button onClick={() => copyToClipboard(session.accessCode)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-white transition">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                   <button 
                     onClick={() => window.open(`https://remotedesktop.google.com/support?session=${session.accessCode}`, '_blank')}
                     className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                   >
                     Connect Now
                   </button>
                   <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                     Done
                   </button>
                </div>
             </div>
           ))}
           {sessions.length === 0 && (
             <div className="col-span-full p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
               <MonitorPlay className="w-12 h-12 mx-auto mb-3 opacity-30" />
               <p>ไม่มีคำขอความช่วยเหลือในขณะนี้</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  // --- CUSTOMER VIEW ---
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
           <MonitorPlay className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">ช่วยเหลือระยะไกล (Remote Support)</h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          ให้ช่างเทคนิคเข้าควบคุมเครื่องคอมพิวเตอร์ของคุณเพื่อแก้ไขปัญหาผ่านระบบ <span className="font-semibold text-indigo-600">Chrome Remote Desktop</span>
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
           </div>
           <h3 className="text-2xl font-bold text-gray-900 mb-2">ส่งรหัสเรียบร้อยแล้ว!</h3>
           <p className="text-gray-600 mb-6">
             กรุณา <span className="font-bold text-red-500">เปิดหน้าจอนี้ค้างไว้</span> ช่างเทคนิคกำลังจะทำการเชื่อมต่อเข้ามาภายใน 1-2 นาที
           </p>
           <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto mb-8 border border-gray-200">
             <p className="text-sm text-gray-500 mb-1">รหัสของคุณ</p>
             <p className="text-3xl font-mono font-bold text-indigo-600 tracking-widest">{accessCode}</p>
           </div>
           <button 
             onClick={() => { setIsSubmitted(false); setAccessCode(''); }}
             className="text-gray-400 text-sm hover:text-gray-600 underline"
           >
             ยกเลิก / ส่งรหัสใหม่
           </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
               {/* Left: Instructions */}
               <div className="space-y-6">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-gray-100 pb-2">ขั้นตอนการใช้งาน</h3>
                  
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center font-bold text-indigo-600">1</div>
                     <div>
                        <h4 className="font-medium text-gray-900">เปิด Chrome Remote Desktop</h4>
                        <p className="text-sm text-gray-500 mt-1">คลิกปุ่มด้านล่างเพื่อเปิดหน้าเว็บ Google Remote ในแท็บใหม่</p>
                        <a 
                          href="https://remotedesktop.google.com/support" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                        >
                          <ExternalLink className="w-4 h-4" /> ไปที่ remotedesktop.google.com
                        </a>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center font-bold text-indigo-600">2</div>
                     <div>
                        <h4 className="font-medium text-gray-900">กดปุ่ม "สร้างรหัส" (Generate Code)</h4>
                        <p className="text-sm text-gray-500 mt-1">
                           ในกล่อง "รับความช่วยเหลือ" (Get Support) ให้กดปุ่มดาวน์โหลด (หากยังไม่มี) หรือกด <span className="font-bold text-gray-700">+ สร้างรหัส</span>
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center font-bold text-indigo-600">3</div>
                     <div>
                        <h4 className="font-medium text-gray-900">นำรหัสมากรอก</h4>
                        <p className="text-sm text-gray-500 mt-1">
                           คัดลอกรหัสตัวเลข 12 หลัก นำมากรอกในช่องทางขวา แล้วกดส่ง
                        </p>
                     </div>
                  </div>
               </div>

               {/* Right: Form */}
               <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                      <Key className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h4 className="font-bold text-gray-900">พร้อมเชื่อมต่อ?</h4>
                    <p className="text-sm text-gray-500">กรอกรหัส Access Code ที่ได้จาก Google</p>
                  </div>

                  <form onSubmit={handleSendCode}>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Access Code</label>
                      <input 
                        type="text" 
                        value={accessCode}
                        onChange={(e) => {
                          // Allow only numbers and spaces
                          const val = e.target.value.replace(/[^0-9 ]/g, '');
                          setAccessCode(val);
                        }}
                        placeholder="0000 0000 0000"
                        maxLength={14}
                        className="w-full text-center text-2xl font-mono p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none tracking-widest bg-white"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={accessCode.length < 12}
                      className={`w-full py-3 rounded-lg font-bold text-white shadow-sm transition flex items-center justify-center gap-2 ${accessCode.length >= 10 ? 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                      <MonitorPlay className="w-5 h-5" /> อนุญาตให้เข้าถึง (Allow Access)
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                      การกดปุ่มนี้เป็นการส่งรหัสให้ช่างเท่านั้น คุณยังต้องกดยอมรับที่หน้าต่าง Chrome Remote Desktop อีกครั้งเมื่อช่างเชื่อมต่อเข้ามา
                    </p>
                  </form>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Customer Tracking Portal ---

const TrackingPortal = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<RepairJob | null>(null);
  const [error, setError] = useState('');

  const handleTrack = () => {
    const found = MOCK_REPAIRS.find(r => r.ticketNumber === ticketInput);
    if (found) {
      setTrackingResult(found);
      setError('');
    } else {
      setTrackingResult(null);
      setError('ไม่พบข้อมูลใบงานนี้ กรุณาตรวจสอบเลขที่ใบงาน');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ติดตามสถานะงานซ่อม</h2>
        <p className="text-gray-500 mb-6">กรอกเลขที่ใบงาน (เช่น R2405-001) เพื่อตรวจสอบสถานะล่าสุด</p>
        
        <div className="flex max-w-md mx-auto gap-2">
          <input 
            type="text" 
            placeholder="เลขที่ใบงาน..." 
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
          />
          <button 
            onClick={handleTrack}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Search className="w-5 h-5" /> ตรวจสอบ
          </button>
        </div>
        {error && <p className="text-red-500 mt-3 text-sm flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4"/> {error}</p>}
      </div>

      {/* Result */}
      {trackingResult && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm mb-1">เลขที่ใบงาน</p>
              <h3 className="text-2xl font-bold">{trackingResult.ticketNumber}</h3>
              <p className="text-indigo-100 mt-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> {trackingResult.device}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {trackingResult.status.replace('_', ' ')}
              </span>
              <p className="mt-2 text-2xl font-bold">฿{trackingResult.cost.toLocaleString()}</p>
              <p className="text-xs text-indigo-200">ค่าใช้จ่ายโดยประมาณ</p>
            </div>
          </div>

          <div className="p-6">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> Timeline การซ่อม
            </h4>
            
            <div className="relative pl-4 border-l-2 border-gray-200 space-y-8">
              {trackingResult.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm"></div>
                  <div>
                    <p className="font-medium text-gray-900">{event.status}</p>
                    <p className="text-sm text-gray-500">{event.date.toLocaleString('th-TH')}</p>
                    {event.note && <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>

            {trackingResult.images.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-gray-800 mb-4">รูปภาพประกอบ</h4>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {trackingResult.images.map((img, i) => (
                    <img key={i} src={img} alt="Repair" className="w-32 h-24 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              </div>
            )}

            {/* Chat Section in Portal */}
            {trackingResult.linkedTicketId && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                 <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" /> สนทนากับช่าง (Chat)
                 </h4>
                 <div className="h-[500px] border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <ChatWindow 
                      ticketId={trackingResult.linkedTicketId} 
                      currentUser={CUSTOMER_USER}
                    />
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ / Knowledge Base */}
      <div className="mt-12">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> คลังความรู้ & คำถามที่พบบ่อย
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['คอมเปิดไม่ติดทำอย่างไร?', 'วิธีเช็คสเปคคอมพิวเตอร์', 'การดูแลรักษากล้องวงจรปิด', 'วิธีเชื่อมต่อ Wi-Fi ที่ถูกต้อง'].map((faq, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer flex justify-between items-center group">
              <span className="text-gray-700">{faq}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Support Desk (Admin & Customer View) ---

const SupportDesk = ({ currentUser }: { currentUser: UserProfile }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tickets, setTickets] = useState(MOCK_TICKETS);

  // Filter Logic:
  // Admin sees ALL tickets.
  // Customer sees ONLY their tickets.
  const myTickets = currentUser.role === 'ADMIN' 
    ? tickets 
    : tickets.filter(t => t.customerId === currentUser.id);

  const filteredTickets = myTickets.filter(t => filterStatus === 'ALL' || t.status === filterStatus);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleCreateTicket = (data: { subject: string, category: TicketCategory, desc: string }) => {
    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      code: `AK-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: data.subject,
      category: data.category,
      status: 'OPEN',
      description: data.desc,
      priority: 2,
      customerId: currentUser.id,
      customerName: currentUser.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to tickets
    setTickets([newTicket, ...tickets]);
    
    // Add initial message
    if (data.desc) {
      MOCK_MESSAGES[newTicket.id] = [{
        id: `m${Date.now()}`,
        ticketId: newTicket.id,
        senderType: currentUser.role === 'CUSTOMER' ? 'CUSTOMER' : 'STAFF',
        senderId: currentUser.id,
        body: data.desc,
        assets: [],
        createdAt: new Date(),
        isRead: false
      }];
    }

    setShowCreateModal(false);
    setSelectedTicketId(newTicket.id);
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Create Modal */}
      {showCreateModal && (
        <CreateTicketModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateTicket} />
      )}

      {/* Ticket List */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col ${selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {currentUser.role === 'ADMIN' ? 'รายการแจ้งปัญหา (All)' : 'ประวัติการแจ้งปัญหา'}
            </h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> แจ้งปัญหา
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${filterStatus === status ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>ไม่มีรายการแจ้งปัญหา</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${selectedTicketId === ticket.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{ticket.category.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400">{ticket.updatedAt.toLocaleDateString()}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{ticket.subject}</h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> {ticket.customerName}
                  </p>
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail & Chat Area */}
      <div className={`w-full md:w-2/3 flex flex-col ${!selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
        {selectedTicket ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedTicketId(null)} className="md:hidden text-gray-500">
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-500">
                    Ticket: {selectedTicket.code} • ลูกค้า: {selectedTicket.customerName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentUser.role === 'ADMIN' ? (
                  <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                ) : (
                  <StatusBadge status={selectedTicket.status} />
                )}
              </div>
            </div>
            
            <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
               <ChatWindow ticketId={selectedTicket.id} currentUser={currentUser} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <LayoutDashboard className="w-16 h-16 mb-4 opacity-20" />
            <p>เลือกรายการเพื่อดูรายละเอียด หรือกด "แจ้งปัญหา" เพื่อสร้างรายการใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SUPPORT' | 'TRACKING' | 'REPAIR' | 'REMOTE'>('SUPPORT');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Simulate User Role Toggle (For Demo)
  const [demoRole, setDemoRole] = useState<'ADMIN' | 'CUSTOMER'>('ADMIN');
  const currentUser = demoRole === 'ADMIN' ? ADMIN_USER : CUSTOMER_USER;

  useEffect(() => {
    // Reset View when role changes
    if (demoRole === 'CUSTOMER') setActiveTab('REMOTE'); // Default to Remote for this demo flow
    else setActiveTab('SUPPORT');
  }, [demoRole]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ARKOM</h1>
            <p className="text-xs text-slate-400">Computer Service</p>
          </div>
        </div>

        <nav className="mt-6 px-3 space-y-2">
          {demoRole === 'ADMIN' ? (
            <>
              <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </button>
              <button onClick={() => setActiveTab('REPAIR')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'REPAIR' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <Wrench className="w-5 h-5" /> งานซ่อม (Repair)
              </button>
              <button onClick={() => setActiveTab('SUPPORT')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'SUPPORT' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <MessageSquare className="w-5 h-5" /> Support Desk
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
              </button>
              <button onClick={() => setActiveTab('REMOTE')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'REMOTE' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <MonitorPlay className="w-5 h-5" /> Remote Support
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab('TRACKING')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'TRACKING' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <Search className="w-5 h-5" /> ติดตามสถานะ
              </button>
              <button onClick={() => setActiveTab('SUPPORT')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'SUPPORT' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <MessageSquare className="w-5 h-5" /> สอบถาม/แจ้งปัญหา
              </button>
              <button onClick={() => setActiveTab('REMOTE')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'REMOTE' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <MonitorPlay className="w-5 h-5" /> ช่วยเหลือระยะไกล
              </button>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3">
             <div className="flex items-center gap-3 mb-3">
                <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-slate-400">{currentUser.role}</p>
                </div>
             </div>
             <button 
                onClick={() => setDemoRole(demoRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN')}
                className="w-full text-xs bg-slate-700 hover:bg-slate-600 py-2 rounded text-center transition border border-slate-600"
             >
               Switch Role (Demo)
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar (Mobile) */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex md:hidden items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <LayoutDashboard className="w-6 h-6" />
            </button>
            <span className="font-bold text-gray-800">อาคมคอมพิวเตอร์</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {activeTab === 'SUPPORT' && <SupportDesk currentUser={currentUser} />}
          {activeTab === 'TRACKING' && (
            <div className="p-6">
              <TrackingPortal />
            </div>
          )}
          {activeTab === 'REPAIR' && (
             <div className="p-8 text-center text-gray-500 mt-20">
                <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold">Repair Module</h2>
                <p>ฟีเจอร์นี้จะเชื่อมต่อกับระบบฐานข้อมูลใบงานจริงใน Phase ถัดไป</p>
             </div>
          )}
          {activeTab === 'REMOTE' && <RemoteSupport currentUser={currentUser} />}
          {activeTab === 'DASHBOARD' && (
             <div className="p-8 text-center text-gray-500 mt-20">
                <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold">Main Dashboard</h2>
                <p>แสดงภาพรวมรายได้และงานประจำวัน</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
