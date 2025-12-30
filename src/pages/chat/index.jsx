"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

// Configurações MANTIDAS
const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function SkyChatUI() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.replace("/");
      setUser(u);

      const q = query(
        collection(db, "chats"),
        where("members", "array-contains", u.uid)
      );
      onSnapshot(q, (snap) =>
        setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );

      const usersSnap = await getDocs(collection(db, "users"));
      setUsers(
        usersSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u2) => u2.id !== u.uid)
      );

      const qInvites = query(
        collection(db, "groupInvites"),
        where("to", "==", u.uid),
        where("status", "==", "pending")
      );
      onSnapshot(qInvites, (snap) => {
        setInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    });

    return () => unsub();
  }, [router]);

  const aceitarGrupo = async (invite) => {
    try {
      const chatRef = doc(db, "chats", invite.chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) return;
      const chatData = chatSnap.data();
      await updateDoc(chatRef, { members: [...chatData.members, user.uid] });
      await updateDoc(doc(db, "groupInvites", invite.id), { status: "accepted" });
    } catch (err) {
      console.error(err);
    }
  };

  const criarGrupoComSenha = async () => {
    if (!groupName || !groupPassword || selectedUsers.length === 0) return;
    const chatRef = await addDoc(collection(db, "chats"), {
      isGroup: true,
      name: groupName,
      password: groupPassword,
      members: [user.uid],
      admins: [user.uid],
      createdAt: serverTimestamp(),
    });
    for (const uid of selectedUsers) {
      await addDoc(collection(db, "groupInvites"), {
        chatId: chatRef.id,
        groupName,
        from: user.uid,
        to: uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    }
    setShowGroupModal(false);
    setGroupName("");
    setGroupPassword("");
    setSelectedUsers([]);
  };

  return (
    <div className="h-screen flex flex-col font-sans text-white overflow-hidden bg-[#050505] relative">
      
      {/* Background de Partículas */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `2px`,
            height: `2px`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      {/* Header Responsivo */}
      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center px-6 py-6 sm:px-10 sm:py-8 bg-black/40 backdrop-blur-2xl border-b border-white/5 gap-4">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
             <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">SkyChat</h1>
             <span className="bg-emerald-500/10 text-emerald-400 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">Seguro & Profissional</span>
          </div>
          <p className="text-[8px] sm:text-[9px] text-gray-500 font-mono mt-1 tracking-[0.2em] uppercase">Status: Em Desenvolvimento v1.0.4-dev</p>
        </div>

        <button
          onClick={() => setShowGroupModal(true)}
          className="w-full sm:w-auto group relative flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] uppercase"
        >
          Novo Canal +
        </button>
      </header>

      {/* Área Principal */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-8 lg:px-20 space-y-8 custom-scrollbar">
        
        {/* Banner Sutil Mobile-Friendly */}
        <div className="w-full py-2 bg-gradient-to-r from-transparent via-white/5 to-transparent flex justify-center border-y border-white/5">
           <p className="text-[8px] sm:text-[10px] text-gray-500 font-medium tracking-widest text-center px-4">CRIPTOGRAFIA ATIVADA • AMBIENTE SEGURO</p>
        </div>

        {/* Convites - Ajustado para Grade */}
        {invites.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 ml-2">Solicitações</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {invites.map((invite) => (
                <div key={invite.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md">
                  <div>
                    <p className="text-sm font-bold text-emerald-200 truncate">{invite.groupName}</p>
                    <p className="text-[9px] text-emerald-500/60 font-mono mt-1 uppercase">Acesso Pendente</p>
                  </div>
                  <button
                    onClick={() => aceitarGrupo(invite)}
                    className="w-full bg-emerald-500 text-black text-[10px] font-black py-2.5 rounded-lg hover:bg-emerald-400 transition-all uppercase"
                  >
                    Ingressar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Chats - Cards Otimizados */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Canais Ativos</h2>
            <span className="text-[9px] text-gray-700 font-bold uppercase">{chats.length} Online</span>
          </div>

          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
            {chats.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center opacity-20 grayscale px-4">
                <div className="w-16 h-16 rounded-full border border-dashed border-white flex items-center justify-center mb-4 text-xl">⌬</div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-center">Nenhum canal de rádio detectado.</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className="group flex items-center gap-4 bg-gradient-to-r from-white/5 to-transparent border border-white/5 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] cursor-pointer hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-xl active:scale-[0.98]"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-black border border-white/10 flex flex-shrink-0 items-center justify-center text-xl shadow-2xl group-hover:bg-white group-hover:text-black transition-all">
                    {chat.isGroup ? "⧉" : "⌬"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-sm sm:text-base tracking-tight truncate">{chat.name || "Chat Privado"}</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate font-light">
                      {chat.lastMessage || "Nenhuma transmissão..."}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[8px] font-mono text-gray-700 uppercase hidden sm:block">ID: {chat.id.slice(0,4)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal - Ajustado para Mobile */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end sm:items-center justify-center z-50 p-0 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[3rem] p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight">Novo Canal</h2>
              <button onClick={() => setShowGroupModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl hover:bg-white/10 transition">×</button>
            </div>
            
            <div className="space-y-4 pb-8 sm:pb-0">
              <input
                placeholder="NOME DO CANAL"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl focus:bg-white/10 outline-none text-[10px] font-bold tracking-widest uppercase"
              />
              <input
                placeholder="SENHA (KEYS)"
                value={groupPassword}
                onChange={(e) => setGroupPassword(e.target.value)}
                type="password"
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl focus:bg-white/10 outline-none text-[10px] font-bold tracking-widest uppercase"
              />
              
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4">Membros Disponíveis</p>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer border border-transparent">
                      <div className="flex items-center gap-3">
                         <img src={u.avatar} className="w-6 h-6 rounded-full grayscale border border-white/10" />
                         <span className="text-[10px] font-bold text-gray-400">{u.nome}</span>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-white"
                        onChange={(e) =>
                          setSelectedUsers((prev) =>
                            e.target.checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={criarGrupoComSenha}
                className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] hover:bg-gray-200 transition-all uppercase tracking-widest active:scale-95 shadow-xl"
              >
                Inicializar Canal
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .particle { position: absolute; background: white; border-radius: 50%; animation: float 15s infinite linear; opacity: 0.2; }
        @keyframes float { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.3; } 100% { transform: translateY(-100vh); opacity: 0; } }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}