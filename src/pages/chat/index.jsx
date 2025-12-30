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
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FiHash, FiLock, FiUnlock, FiUsers, FiPlus, FiTerminal, FiGlobe, FiShield, FiCpu, FiX } from "react-icons/fi";

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
  const [allGroups, setAllGroups] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(null);
  
  const [groupName, setGroupName] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [activeTab, setActiveTab] = useState("meus");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.replace("/");
      setUser(u);

      const qAll = query(collection(db, "chats"), where("isGroup", "==", true));
      onSnapshot(qAll, (snap) => {
        setAllGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });

      const usersSnap = await getDocs(collection(db, "users"));
      setUsersCount(usersSnap.size);
    });

    return () => unsub();
  }, [router]);

  const entrarNoGrupo = async (group) => {
    if (group.members.includes(user.uid)) {
      router.push(`/chat/${group.id}`);
      return;
    }
    if (group.password) {
      setShowPassModal(group);
      return;
    }
    await realizarEntrada(group.id, group.members);
  };

  const realizarEntrada = async (chatId, currentMembers) => {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, { members: [...currentMembers, user.uid] });
    router.push(`/chat/${chatId}`);
  };

  const validarSenhaEEntrar = async () => {
    if (inputPass === showPassModal.password) {
      await realizarEntrada(showPassModal.id, showPassModal.members);
    } else {
      alert("ACESSO NEGADO: CHAVE INCORRETA");
    }
  };

  const criarGrupoComSenha = async () => {
    if (!groupName || !groupPassword) return;
    await addDoc(collection(db, "chats"), {
      isGroup: true,
      name: groupName,
      password: groupPassword,
      members: [user.uid],
      admins: [user.uid],
      createdAt: serverTimestamp(),
      lastMessage: "SISTEMA: CANAL INICIALIZADO",
    });
    setShowGroupModal(false);
    setGroupName("");
    setGroupPassword("");
  };

  const meusGrupos = allGroups.filter(g => g.members?.includes(user?.uid));
  const descobertaGrupos = allGroups.filter(g => !g.members?.includes(user?.uid));

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-zinc-100 overflow-hidden font-mono selection:bg-white selection:text-black">
      
      {/* BARRA DE STATUS DECORATIVA (TOPO) */}
      <div className="h-6 bg-white flex items-center px-4 justify-between overflow-hidden">
        <div className="flex gap-4 items-center">
          <span className="text-[9px] font-black text-black animate-pulse">● LIVE_SYSTEM_FEED</span>
          <span className="text-[9px] font-bold text-black opacity-60">ID: {user?.uid?.slice(0,8)}</span>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <span className="text-[9px] font-bold text-black tracking-widest uppercase">Encryption: AES-256-GCM</span>
          <span className="text-[9px] font-bold text-black uppercase tracking-widest text-right">Node: BRA_FOR_08</span>
        </div>
      </div>

      {/* HEADER PRINCIPAL */}
      <header className="px-6 py-8 md:px-12 border-b border-white/10 bg-black flex flex-col md:flex-row justify-between items-center gap-8 z-50">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">
            SKY<span className="text-zinc-500">CHAT</span>
          </h1>
          <p className="text-[8px] mt-2 text-zinc-600 tracking-[0.5em] uppercase font-bold">Protocolo de Comunicação Segura</p>
        </div>

        <nav className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab("meus")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'meus' ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
          >
            <FiCpu /> Meus Canais
          </button>
          <button 
            onClick={() => setActiveTab("descoberta")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'descoberta' ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
          >
            <FiGlobe /> Explorar
          </button>
        </nav>

        <button 
          onClick={() => setShowGroupModal(true)}
          className="group flex items-center gap-3 bg-zinc-900 border border-white/10 text-white px-8 py-4 rounded-full font-black text-[10px] transition-all hover:bg-white hover:text-black uppercase tracking-widest"
        >
          <FiPlus className="group-hover:rotate-90 transition-transform" /> Criar Canal
        </button>
      </header>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        
        {/* TEXTO DECORATIVO DE FUNDO */}
        <div className="mb-8 flex flex-wrap gap-4 items-center border-l-2 border-white/10 pl-6 py-2">
           <div className="flex flex-col">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Acesso Global</span>
              <span className="text-xs font-black">{allGroups.length} Frequências</span>
           </div>
           <div className="h-4 w-px bg-white/10 mx-4" />
           <div className="flex flex-col">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Usuários</span>
              <span className="text-xs font-black">{usersCount} Conectados</span>
           </div>
           <div className="ml-auto hidden lg:block">
              <p className="text-[9px] text-zinc-700 italic max-w-xs text-right leading-tight">
                "O silêncio é uma virtude, mas a comunicação é uma arma. Use seu acesso com sabedoria."
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {(activeTab === "meus" ? meusGrupos : descobertaGrupos).map((group) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={group.id}
                onClick={() => entrarNoGrupo(group)}
                className="group relative bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl cursor-pointer hover:border-white/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-zinc-900 border border-white/5 group-hover:bg-white group-hover:text-black transition-all`}>
                    <FiTerminal size={18} />
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">Status</p>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                       Online <div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tighter truncate mb-2">{group.name}</h3>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5 text-[9px] font-bold text-zinc-500 flex items-center gap-1 uppercase">
                    <FiUsers size={10} /> {group.members?.length || 0}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5 text-[9px] font-bold text-zinc-500 flex items-center gap-1 uppercase tracking-widest">
                    {group.password ? <><FiLock size={10} /> Keys</> : <><FiUnlock size={10} /> Open</>}
                  </span>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Última Transmissão</span>
                  <p className="text-[10px] text-zinc-500 truncate italic">
                    {group.lastMessage || "Sinal ausente..."}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER DECORATIVO */}
      <footer className="h-10 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-6">
        <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.3em]">SkyChat Infrastructure v1.0.4-dev</span>
        <div className="flex gap-4">
           <div className="h-2 w-2 rounded-full bg-zinc-800" />
           <div className="h-2 w-2 rounded-full bg-zinc-800" />
           <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </footer>

      {/* MODAL CRIAR CANAL */}
      <AnimatePresence>
        {showGroupModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 w-full max-w-md p-10 rounded-[3rem] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Novo Canal</h2>
                <button onClick={() => setShowGroupModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><FiX size={24} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Identificador da Frequência</p>
                  <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="NOME_DO_CANAL" className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl outline-none focus:border-white transition-all font-black uppercase text-xs" />
                </div>
                
                <div>
                  <p className="text-[9px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Chave de Encriptação</p>
                  <input type="password" value={groupPassword} onChange={(e) => setGroupPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl outline-none focus:border-white transition-all font-black text-xs" />
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-[8px] text-zinc-500 font-bold leading-normal uppercase">
                     Atenção: Todos os canais criados são registrados no diretório global. Use nomes que permitam identificação por outros agentes ou mantenha a chave em segredo.
                   </p>
                </div>

                <button onClick={criarGrupoComSenha} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all">
                  Inicializar Protocolo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SENHA */}
      <AnimatePresence>
        {showPassModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/98 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-red-500/20 w-full max-w-xs p-10 rounded-[2.5rem] text-center"
            >
              <FiShield size={32} className="mx-auto mb-6 text-red-500" />
              <h2 className="text-xs font-black uppercase tracking-widest mb-2 italic">Acesso Restrito</h2>
              <p className="text-[9px] text-zinc-600 uppercase mb-8 font-bold tracking-tighter">O canal {showPassModal.name} exige autenticação</p>
              
              <input 
                autoFocus
                type="password" 
                value={inputPass} 
                onChange={(e) => setInputPass(e.target.value)}
                placeholder="KEY_ACCESS"
                className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl outline-none mb-4 text-center font-black tracking-widest"
              />

              <div className="flex flex-col gap-2">
                <button onClick={validarSenhaEEntrar} className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Validar</button>
                <button onClick={() => setShowPassModal(null)} className="w-full py-4 text-[9px] font-black uppercase text-zinc-700">Abortar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
}