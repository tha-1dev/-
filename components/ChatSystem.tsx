
import React, { useState, useEffect, useRef } from 'react';
import { FileText, CheckCheck, Check, X, ImageIcon, Send } from 'lucide-react';
import { UserProfile, Message, FileAsset } from '../types';

// Mock Data
const MOCK_MESSAGES: Record<string, Message[]> = {
  'default': []
};

// Chat Component
export const ChatWindow = ({ ticketId, currentUser }: { ticketId: string, currentUser: UserProfile }) => {
   const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[ticketId] || []);
   const [text, setText] = useState('');
   const [attachments, setAttachments] = useState<FileAsset[]>([]);
   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      setMessages(MOCK_MESSAGES[ticketId] || []);
   }, [ticketId]);

   useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   const handleAttachMockImage = () => {
      const newAsset: FileAsset = {
          id: `asset-${Date.now()}`,
          kind: 'IMAGE',
          mimeType: 'image/jpeg',
          filename: `photo-${Date.now()}.jpg`,
          sizeBytes: 1024 * 500,
          url: `https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=80` 
      };
      setAttachments([...attachments, newAsset]);
   };

   const send = () => {
      if(!text.trim() && attachments.length === 0) return;
      const msg: Message = {
         id: Date.now().toString(), ticketId, senderType: currentUser.role === 'ADMIN' ? 'STAFF' : 'CUSTOMER',
         senderId: currentUser.id, body: text, assets: attachments, createdAt: new Date(), isRead: false
      };
      setMessages([...messages, msg]);
      setText('');
      setAttachments([]);
      if(currentUser.role !== 'CUSTOMER') {
         setTimeout(() => {
             setMessages(prev => prev.map(m => m.id === msg.id ? {...m, isRead: true} : m));
         }, 2000);
      }
   };

   return (
      <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-[500px]">
         <div className="bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center">
            <span className="font-bold text-sm text-gray-700">Ticket #{ticketId}</span>
            <span className="text-xs text-gray-400">Online</span>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 && (
                <div className="text-center text-gray-400 text-xs py-10">No messages yet. Start conversation.</div>
            )}
            {messages.map(m => {
               const isMe = (currentUser.role === 'ADMIN' && m.senderType === 'STAFF') || (currentUser.role === 'CUSTOMER' && m.senderType === 'CUSTOMER');
               return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${isMe ? 'bg-[#DC2626] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                        {m.assets && m.assets.length > 0 && (
                            <div className="flex flex-col gap-2 mb-2">
                                {m.assets.map(asset => (
                                    <div key={asset.id} className="relative group overflow-hidden rounded-lg">
                                        {asset.kind === 'IMAGE' ? (
                                            <img 
                                                src={asset.url} 
                                                alt={asset.filename} 
                                                className="max-w-full max-h-[200px] w-auto h-auto object-contain rounded-lg cursor-pointer border border-black/5 hover:opacity-95 transition"
                                                onClick={() => window.open(asset.url, '_blank')}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 bg-black/20 p-2 rounded backdrop-blur-sm">
                                                <FileText className="w-4 h-4" />
                                                <span className="text-xs truncate max-w-[150px]">{asset.filename}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {m.body && <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>}
                        <div className={`text-[10px] mt-1 text-right flex justify-end items-center gap-1 ${isMe ? 'text-red-200' : 'text-gray-400'}`}>
                           {m.createdAt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           {isMe && (m.isRead ? <CheckCheck className="w-3 h-3 text-white" /> : <Check className="w-3 h-3" />)}
                        </div>
                     </div>
                  </div>
               );
            })}
            <div ref={scrollRef} />
         </div>
         
         <div className="bg-white border-t border-gray-100 p-2">
            {attachments.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mb-2 px-2">
                    {attachments.map(a => (
                        <div key={a.id} className="relative inline-block">
                            <img src={a.url} className="w-16 h-16 object-cover rounded border border-gray-200" />
                            <button 
                                onClick={() => setAttachments(attachments.filter(x => x.id !== a.id))}
                                className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5 hover:bg-gray-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-2 items-center">
                <button 
                  onClick={handleAttachMockImage}
                  className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-red-50 rounded-full transition"
                  title="Attach Image (Mock)"
                >
                    <ImageIcon className="w-5 h-5"/>
                </button>
                <input 
                  className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#DC2626] focus:bg-white outline-none transition" 
                  placeholder="Type message..." 
                  value={text} 
                  onChange={e=>setText(e.target.value)} 
                  onKeyDown={e=>e.key==='Enter'&&send()} 
                />
                <button onClick={send} className="p-2.5 bg-[#DC2626] text-white rounded-full hover:bg-red-700 shadow-lg shadow-red-200 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!text.trim() && attachments.length === 0}>
                   <Send className="w-4 h-4"/>
                </button>
            </div>
         </div>
      </div>
   );
};
