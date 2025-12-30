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
  getDocs,
  updateDoc,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiTrash2,
  FiX,
  FiSlash,
  FiShield,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
  FiSettings,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

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
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [chatData, setChatData] = useState(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [activePoll, setActivePoll] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const [privacy, setPrivacy] = useState({
    showOnline: true,
    showTyping: true,
  });

  const [mutedUsers, setMutedUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const messagesEndRef = useRef();

  useEffect(() => {
    const savedMuted = localStorage.getItem("sky_muted");
    const savedBlocked = localStorage.getItem("sky_blocked");
    const savedPrivacy = localStorage.getItem("sky_privacy");
    if (savedMuted) setMutedUsers(JSON.parse(savedMuted));
    if (savedBlocked) setBlockedUsers(JSON.parse(savedBlocked));
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
  }, []);

  useEffect(() => {
    localStorage.setItem("sky_muted", JSON.stringify(mutedUsers));
    localStorage.setItem("sky_blocked", JSON.stringify(blockedUsers));
    localStorage.setItem("sky_privacy", JSON.stringify(privacy));
  }, [mutedUsers, blockedUsers, privacy]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.replace("/");
      setUser(u);
      if (!chatId) return;

      onSnapshot(doc(db, "chats", chatId), (snap) => setChatData(snap.data()));

      const msgQuery = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt")
      );
      onSnapshot(msgQuery, (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      });

      const typingQuery = collection(db, "chats", chatId, "typing");
      onSnapshot(typingQuery, (snap) => {
        setTypingUsers(
          snap.docs.map((d) => d.data()).filter((t) => t.userId !== u.uid)
        );
      });

      const pollQuery = query(collection(db, "chats", chatId, "polls"));
      onSnapshot(pollQuery, (snap) => {
        const poll = snap.docs[0];
        if (poll) setActivePoll({ id: poll.id, ...poll.data() });
        else setActivePoll(null);
      });

      const usersSnap = await getDocs(collection(db, "users"));
      setAllUsers(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [chatId, router]);

  const handleTyping = async (e) => {
    setText(e.target.value);
    if (!user || !chatId || !privacy.showTyping) return;
    const typingRef = doc(db, "chats", chatId, "typing", user.uid);
    if (e.target.value.length > 0) {
      await setDoc(typingRef, {
        userId: user.uid,
        nome: user.displayName || "Agente",
      });
      setTimeout(async () => await deleteDoc(typingRef), 3000);
    } else {
      await deleteDoc(typingRef);
    }
  };

  const deletePermanent = async (e, msgId) => {
    e.stopPropagation();
    await deleteDoc(doc(db, "chats", chatId, "messages", msgId));
    setSelectedMsg(null);
  };

  const iniciarVotoBan = async (targetId) => {
    if (activePoll) return;
    const target = allUsers.find((u) => u.id === targetId);
    await addDoc(collection(db, "chats", chatId, "polls"), {
      targetId,
      targetName: target?.nome || "Agente",
      votes: { [user.uid]: "sim" },
      totalMembers: chatData.members.length,
    });
    setSelectedUser(null);
  };

  const votar = async (voto) => {
    const pollRef = doc(db, "chats", chatId, "polls", activePoll.id);
    if (voto === "nao") return await deleteDoc(pollRef);
    const novasVotos = { ...activePoll.votes, [user.uid]: voto };
    const totalSim = Object.values(novasVotos).filter(
      (v) => v === "sim"
    ).length;
    if (totalSim >= activePoll.totalMembers - 1) {
      await updateDoc(doc(db, "chats", chatId), {
        members: chatData.members.filter((m) => m !== activePoll.targetId),
      });
      await deleteDoc(pollRef);
    } else {
      await updateDoc(pollRef, { votes: novasVotos });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#020202] text-white font-mono relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1d1d1d] to-[#020202] opacity-50" />

      <AnimatePresence>
        {showPrivacyNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl"
          >
            <div className="max-w-md bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] text-center">
              <FiShield size={40} className="mx-auto mb-6" />
              <h2 className="text-lg font-black uppercase mb-4 italic tracking-tighter">
                SkyChat Privacy
              </h2>
              <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold text-justify mb-8">
                Qualquer pessoa pode usar este canal. O banco de dados deleta as
                mensagens permanentemente sem retorno em caso de exclusão. Em
                caso de problemas judiciais, não teremos responsabilidade. Não
                iremos e não colaboraremos com autoridades armazenando ou
                exportando dados eliminados.
              </p>
              <button
                onClick={() => setShowPrivacyNotice(false)}
                className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase text-xs"
              >
                ACEITAR TERMOS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-20 flex items-center justify-between px-6 bg-black/80 border-b border-white/5 z-50 fixed top-0 w-full backdrop-blur-lg">
        <div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
            SkyChat
          </h1>
          {typingUsers.length > 0 && (
            <span className="text-[9px] text-emerald-500 animate-pulse font-bold">
              DIGITANDO...
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <FiSettings
            className="text-zinc-500 text-xl cursor-pointer"
            onClick={() => setShowSettings(true)}
          />
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pt-24 pb-28 px-4 md:px-20 space-y-6 z-10 custom-scrollbar">
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid;
          if (
            mutedUsers.includes(m.senderId) ||
            blockedUsers.includes(m.senderId)
          )
            return null;
          const sender = allUsers.find((u) => u.id === m.senderId);

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`flex items-end gap-3 max-w-[90%] md:max-w-[70%] ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="relative">
                  <img
                    onClick={() =>
                      !isMe &&
                      setSelectedUser(
                        sender || { id: m.senderId, nome: "Agente" }
                      )
                    }
                    src={
                      sender?.avatar ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${m.senderId}`
                    }
                    className="w-10 h-10 rounded-xl border border-white/10 cursor-pointer"
                  />
                  {privacy.showOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
                  )}
                </div>
                <div
                  onClick={() => isMe && setSelectedMsg(m)}
                  className={`p-4 rounded-2xl text-sm border shadow-2xl transition-all cursor-pointer ${
                    isMe
                      ? "bg-white text-black font-bold border-white rounded-tr-none"
                      : "bg-zinc-900/90 border-white/5 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm"
            >
              <h2 className="text-xl font-black uppercase mb-8 tracking-tighter italic text-center">
                Configurações
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() =>
                    setPrivacy((p) => ({ ...p, showOnline: !p.showOnline }))
                  }
                  className="w-full flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5"
                >
                  <span className="text-xs font-bold uppercase">
                    Status Online
                  </span>
                  {privacy.showOnline ? (
                    <FiEye className="text-emerald-500" />
                  ) : (
                    <FiEyeOff className="text-red-500" />
                  )}
                </button>
                <button
                  onClick={() =>
                    setPrivacy((p) => ({ ...p, showTyping: !p.showTyping }))
                  }
                  className="w-full flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5"
                >
                  <span className="text-xs font-bold uppercase">
                    Digitando em tempo real
                  </span>
                  {privacy.showTyping ? (
                    <FiEye className="text-emerald-500" />
                  ) : (
                    <FiEyeOff className="text-red-500" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 py-5 bg-white text-black font-black rounded-2xl uppercase text-[10px]"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-white/10 w-full max-w-xs p-8 rounded-[2.5rem] text-center"
            >
              <img
                src={selectedUser.avatar}
                className="w-20 h-20 mx-auto rounded-2xl mb-4"
              />
              <h2 className="text-sm font-black uppercase mb-8">
                {selectedUser.nome}
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMutedUsers([...mutedUsers, selectedUser.id]);
                    setSelectedUser(null);
                  }}
                  className="w-full p-4 bg-zinc-900 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                >
                  Silenciar
                </button>
                <button
                  onClick={() => {
                    setBlockedUsers([...blockedUsers, selectedUser.id]);
                    setSelectedUser(null);
                  }}
                  className="w-full p-4 bg-zinc-900 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase text-red-500 flex items-center justify-center gap-2"
                >
                  Bloquear
                </button>
                <button
                  onClick={() => iniciarVotoBan(selectedUser.id)}
                  className="w-full p-4 bg-red-600 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                >
                  Votar Banimento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMsg && (
          <div
            className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedMsg(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-zinc-950 border border-red-500/20 p-8 rounded-[2.5rem] text-center"
            >
              <FiTrash2 size={32} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-xs font-black uppercase mb-8">
                Deletar do Banco?
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={(e) => deletePermanent(e, selectedMsg.id)}
                  className="w-full bg-red-600 p-5 rounded-2xl font-black uppercase text-[10px]"
                >
                  Excluir Permanente
                </button>
                <button
                  onClick={() => setSelectedMsg(null)}
                  className="w-full p-4 text-[10px] font-black uppercase text-zinc-600"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 w-full p-6 bg-gradient-to-t from-black to-transparent z-40">
        <div className="max-w-4xl mx-auto flex gap-2 bg-zinc-900 border border-white/10 p-2 rounded-2xl">
          <input
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              text.trim() &&
              addDoc(collection(db, "chats", chatId, "messages"), {
                senderId: user.uid,
                text,
                createdAt: serverTimestamp(),
              }).then(() => setText(""))
            }
            placeholder="MENSAGEM..."
            className="flex-1 bg-transparent px-4 outline-none text-xs font-bold uppercase"
          />
          <button
            onClick={() =>
              text.trim() &&
              addDoc(collection(db, "chats", chatId, "messages"), {
                senderId: user.uid,
                text,
                createdAt: serverTimestamp(),
              }).then(() => setText(""))
            }
            className="bg-white text-black h-12 w-12 flex items-center justify-center rounded-xl"
          >
            <FiSend />
          </button>
        </div>
      </footer>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
