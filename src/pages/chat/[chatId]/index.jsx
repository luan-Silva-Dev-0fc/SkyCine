"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  setDoc,
  deleteDoc
} from "firebase/firestore";

// Configuração MANTIDA
const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function ChatRoom() {
  const router = useRouter();
  const { chatId } = router.query;

  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // Para o menu do avatar
  const messagesEndRef = useRef();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.replace("/");
      setUser(u);
      if (!chatId) return;

      // Monitorar Mensagens
      const msgQuery = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt"));
      onSnapshot(msgQuery, (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTimeout(scrollToBottom, 100);
      });

      // Monitorar Quem está digitando
      const typingQuery = collection(db, "chats", chatId, "typing");
      onSnapshot(typingQuery, (snap) => {
        setTypingUsers(snap.docs.map(d => d.data()).filter(t => t.userId !== u.uid));
      });

      // Carregar Usuários
      const usersSnap = await getDocs(collection(db, "users"));
      setAllUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [chatId]);

  // Função para indicar que está digitando
  const handleTyping = async (e) => {
    setText(e.target.value);
    if (!user || !chatId) return;
    
    const typingRef = doc(db, "chats", chatId, "typing", user.uid);
    if (e.target.value.length > 0) {
      await setDoc(typingRef, { userId: user.uid, nome: user.displayName || "Alguém", timestamp: Date.now() });
      setTimeout(async () => await deleteDoc(typingRef), 3000);
    } else {
      await deleteDoc(typingRef);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: user.uid,
      text,
      replyTo: replyTo ? { text: replyTo.text, senderName: replyTo.senderName } : null,
      createdAt: serverTimestamp(),
      isDeleted: false
    });
    setText("");
    setReplyTo(null);
  };

  const deleteMessage = async (msgId) => {
    // Atualiza para deletado e remove o texto original do banco para privacidade total
    await updateDoc(doc(db, "chats", chatId, "messages", msgId), {
      isDeleted: true,
      text: "Esta mensagem foi removida e os dados foram apagados permanentemente dos nossos servidores.",
      originalText: null 
    });
  };

  return (
    <div className="h-screen flex flex-col text-white font-sans overflow-hidden bg-[#0a0a0a] relative">
      
      {/* Background de Partículas Tecnológicas */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="particles-container">
           {[...Array(20)].map((_, i) => (
             <div key={i} className="particle" style={{
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               animationDelay: `${Math.random() * 5}s`
             }}></div>
           ))}
        </div>
      </div>

      {/* Header Glassmorphism */}
      <header className="h-20 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-widest text-white">SKY<span className="text-gray-500">CHAT</span></h1>
          <div className="h-4 w-[1px] bg-white/10"></div>
          {typingUsers.length > 0 && (
            <span className="text-[10px] text-emerald-400 font-mono animate-pulse uppercase tracking-tighter">
              {typingUsers[0].nome} está digitando...
            </span>
          )}
        </div>
      </header>

      {/* Feed de Mensagens */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar">
        {messages.map((m) => {
          if (mutedUsers.includes(m.senderId)) return null;
          const isMe = m.senderId === user?.uid;
          const sender = allUsers.find(u => u.id === m.senderId);

          return (
            <div key={m.id} className={`flex gap-4 ${isMe ? "flex-row-reverse" : "flex-row"} animate-in fade-in duration-500`}>
              
              {/* Avatar com Menu de Opções */}
              <div className="relative flex-shrink-0">
                <img 
                  src={sender?.avatar || "https://i.pinimg.com/736x/0a/db/6b/0adb6bd452807b8c821c8e66cd104a23.jpg"} 
                  className={`w-10 h-10 rounded-full border border-white/10 cursor-pointer hover:scale-110 transition-all ${activeMenu === m.id ? 'ring-2 ring-white' : ''}`}
                  onClick={() => setActiveMenu(activeMenu === m.id ? null : m.id)}
                />
                
                {activeMenu === m.id && !isMe && (
                  <div className="absolute top-12 left-0 w-40 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                    <button onClick={() => { setMutedUsers([...mutedUsers, m.senderId]); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 transition border-b border-white/5">🔇 Silenciar</button>
                    <button className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 transition border-b border-white/5 text-orange-400">🚫 Bloquear</button>
                    <button className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 transition text-red-500">⚠️ Denunciar</button>
                  </div>
                )}
              </div>

              <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                {/* Resposta (Reply) */}
                {m.replyTo && (
                  <div className="bg-white/5 border-l-2 border-white/20 p-2 mb-[-10px] rounded-t-xl text-[10px] opacity-60 italic">
                    Respondendo a {m.replyTo.senderName}: {m.replyTo.text.slice(0, 30)}...
                  </div>
                )}

                <div 
                  onClick={() => !m.isDeleted && setReplyTo({ text: m.text, senderName: sender?.nome || "Usuário" })}
                  className={`
                    px-5 py-3 rounded-3xl text-sm transition-all cursor-pointer relative group
                    ${m.isDeleted ? "bg-red-500/10 border border-red-500/20 text-red-300 italic text-xs" : 
                      isMe ? "bg-white text-black font-medium rounded-tr-none shadow-[0_10px_30px_rgba(255,255,255,0.05)]" : 
                      "bg-gray-800/80 backdrop-blur-md text-gray-100 rounded-tl-none border border-white/5 hover:bg-gray-700"}
                  `}
                >
                  {m.text}
                  
                  {isMe && !m.isDeleted && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteMessage(m.id); }}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:scale-125 transition-all"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="text-[8px] font-bold text-gray-600 uppercase mt-1 px-1 tracking-widest">{sender?.nome}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Barra de Resposta Ativa */}
      {replyTo && (
        <div className="mx-6 p-3 bg-white/5 border border-white/10 rounded-t-2xl flex justify-between items-center animate-in slide-in-from-bottom-2">
           <p className="text-[10px] text-gray-400">Respondendo <b>{replyTo.senderName}</b>: {replyTo.text.slice(0, 40)}...</p>
           <button onClick={() => setReplyTo(null)} className="text-white text-xs px-2">✕</button>
        </div>
      )}

      {/* Input Tecnológico */}
      <footer className="p-6 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-2xl">
          <input
            type="text"
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Digite sua mensagem segura..."
            className="flex-1 bg-transparent px-6 py-3 outline-none text-sm placeholder:text-gray-700"
          />
          <button
            onClick={sendMessage}
            className="bg-white text-black h-12 px-6 rounded-xl font-black hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            ENVIAR
          </button>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: float 10s infinite linear;
        }

        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}