
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatRoom } from '../types';
import { Language, translations } from '../translations';

interface ChatroomsProps {
  language: Language;
}

const INITIAL_ROOMS: ChatRoom[] = [
  { id: 'room-1', name: 'General Political Debate', description: 'Discussion on recent national policy changes.', participants: 12 },
  { id: 'room-2', name: 'Local Infrastructure Focus', description: 'Real-time updates on local road repairs.', participants: 5 },
  { id: 'room-3', name: 'Anonymous Fact Check', description: 'Verifying claims made by local leaders.', participants: 8 }
];

const Chatrooms: React.FC<ChatroomsProps> = ({ language }) => {
  const t = translations[language];
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>(INITIAL_ROOMS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ name: '', description: '' });
  const [anonymousName] = useState(() => {
    const adj = ['Swift', 'Bold', 'Silent', 'Wise', 'Just', 'Vigilant'];
    const noun = ['Citizen', 'Patriot', 'Observer', 'TruthSeeker', 'Voter'];
    return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}#${Math.floor(Math.random() * 900) + 100}`;
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // When leaving room, messages are naturally cleared as they are only in component state for this demo
  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    setMessages([]);
  };

  const handleJoinRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    setMessages([
      {
        id: 'sys-1',
        senderId: 'system',
        senderName: 'System',
        text: `Welcome to ${room?.name}. Your anonymous identity is: ${anonymousName}. ${t.roomDeletedMsg}`,
        timestamp: new Date(),
        isSystem: true
      }
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: anonymousName,
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    
    // Simulate other anonymous users
    setTimeout(() => {
      const responses = [
        "I agree with that point.",
        "Can someone verify this claim?",
        "Interesting perspective. We need more transparency.",
        "Does anyone have the official documentation for this?",
        "The situation in my ward is similar."
      ];
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'other',
        senderName: `Anonymous#${Math.floor(Math.random() * 900) + 100}`,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1500);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name: newRoomData.name,
      description: newRoomData.description,
      participants: 1
    };
    setRooms([newRoom, ...rooms]);
    setShowCreateModal(false);
    setNewRoomData({ name: '', description: '' });
    handleJoinRoom(newRoom.id);
  };

  if (activeRoomId) {
    const room = rooms.find(r => r.id === activeRoomId);
    return (
      <div className="h-[calc(100vh-160px)] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in duration-300">
        {/* Chat Header */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9l-4 4v-4H3a2 2 0 01-2-2V10a2 2 0 012-2h2M9 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-4-4h-6l-4 4z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{room?.name}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room?.participants} {t.online} • {anonymousName} (You)</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLeaveRoom}
            className="px-5 py-2.5 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 font-black text-xs rounded-xl hover:bg-rose-100 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {t.leaveRoom}
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/30 dark:bg-slate-950/20">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isSystem ? 'justify-center' : msg.senderId === 'me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              {msg.isSystem ? (
                <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-2 rounded-full border border-blue-100 dark:border-blue-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   {msg.text}
                </div>
              ) : (
                <div className={`max-w-[70%] space-y-1 ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${msg.senderId === 'me' ? 'text-indigo-500' : 'text-slate-400'}`}>
                    {msg.senderName}
                  </div>
                  <div className={`px-5 py-3 rounded-2xl text-sm shadow-sm ${
                    msg.senderId === 'me' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t.typeMessage}
              className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition"
            />
            <button 
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t.anonymousChat}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Connect anonymously to discuss local and national issues safely.</p>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition flex items-center gap-2 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          {t.createRoom}
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t.createRoom}</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreateRoom} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Room Name</label>
                  <input required placeholder="e.g., Delhi Air Quality Chat" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={newRoomData.name} onChange={e => setNewRoomData({...newRoomData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Topic Description</label>
                  <textarea required placeholder="What is this room about?" rows={3} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" value={newRoomData.description} onChange={e => setNewRoomData({...newRoomData, description: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
                  Start Chatting Anonymously
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9l-4 4v-4H3a2 2 0 01-2-2V10a2 2 0 012-2h2M9 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-4-4h-6l-4 4z" /></svg>
            </div>
            
            <div className="flex-1 space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100/50 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {room.participants} {t.activeNow}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{room.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{room.description}</p>
              </div>
            </div>

            <button 
              onClick={() => handleJoinRoom(room.id)}
              className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {t.joinRoom}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7M5 12h16" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chatrooms;
