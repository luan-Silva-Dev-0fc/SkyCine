"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiAtSign, FiCamera, FiCheck, FiArrowRight, FiX, FiLoader } from "react-icons/fi";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.appspot.com",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const gerarUsername = (nome) => `${nome.split(" ")[0].toLowerCase()}_${Math.floor(Math.random() * 9999)}`;
const gerarID = (nome) => `${nome.split(" ")[0].toLowerCase()}${Math.floor(Math.random() * 9999)}`;

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [colecoes, setColecoes] = useState([]);
  const [abrirAvatarPicker, setAbrirAvatarPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const isRedirecting = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/");
        return;
      }
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && !isRedirecting.current) {
        isRedirecting.current = true;
        router.replace("/Inicio");
      } else {
        setUser(u);
        setChecking(false);
        const colSnap = await getDocs(collection(db, "colecoes"));
        setColecoes(colSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
    return () => unsub();
  }, [router]);

  const salvarPerfil = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const finalUsername = username || gerarUsername(nome);
      await setDoc(doc(db, "users", user.uid), {
        nome,
        username: finalUsername,
        idPerfil: gerarID(nome),
        avatar,
        criadoEm: new Date(),
      });
      router.replace("/Inicio");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <FiLoader className="text-purple-600 size-8" />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-4 font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[140px]" />
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-112.5 bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
      >
        <div className="flex gap-2 mb-10 justify-center">
          {[1, 2].map((i) => (
            <div key={i} className="h-1 bg-zinc-800 rounded-full w-12 overflow-hidden">
              <motion.div 
                initial={false}
                animate={{ width: step >= i ? "100%" : "0%" }}
                className="h-full bg-linear-to-r from-purple-600 to-blue-500"
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                  SKY<span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-blue-400">CINE</span>
                </h2>
                <p className="text-zinc-400 text-sm font-medium">Personalize sua identidade na plataforma</p>
              </div>

              <div className="space-y-4">
                <div className="group relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    placeholder="Seu nome real"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-950/50 border border-white/5 outline-none focus:border-purple-500/50 focus:ring-4 ring-purple-500/10 transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div className="group relative">
                  <FiAtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    placeholder="Username único (ex: sky_walker)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-950/50 border border-white/5 outline-none focus:border-purple-500/50 focus:ring-4 ring-purple-500/10 transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!nome}
                onClick={() => setStep(2)}
                className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-all shadow-lg hover:shadow-white/10"
              >
                Continuar <FiArrowRight />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-white">Visual Profile</h2>
                <p className="text-zinc-400 text-sm">Escolha uma imagem de coleções exclusivas.</p>
              </div>

              <div className="flex justify-center">
                <div className="relative group">
                  <div className="w-36 h-36 rounded-full p-1 bg-linear-to-tr from-purple-600 via-transparent to-blue-500">
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border-4 border-zinc-950">
                      {avatar ? (
                        <motion.img layoutId="avatar" src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <FiUser size={40} className="text-zinc-700" />
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAbrirAvatarPicker(true)}
                    className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl border-2 border-zinc-950"
                  >
                    <FiCamera size={18} />
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-zinc-800/50 py-4 rounded-2xl font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  Voltar
                </button>
                <motion.button
                  whileHover={!(!avatar || loading) ? { scale: 1.02 } : {}}
                  whileTap={!(!avatar || loading) ? { scale: 0.98 } : {}}
                  disabled={!avatar || loading}
                  onClick={salvarPerfil}
                  className="flex-2 bg-linear-to-r from-purple-600 to-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20 disabled:opacity-30 transition-opacity"
                >
                  {loading ? <FiLoader className="animate-spin" /> : <><FiCheck /> Finalizar</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal de Avatar com tokens v4 */}
      <AnimatePresence>
        {abrirAvatarPicker && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAbrirAvatarPicker(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 w-full max-w-lg p-8 rounded-[2.5rem] border border-white/10 shadow-3xl relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">Galeria de Avatares</h3>
                  <p className="text-xs text-zinc-500">Selecione um item das coleções SkyCine</p>
                </div>
                <button onClick={() => setAbrirAvatarPicker(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-112.5 overflow-y-auto pr-4 custom-scroll">
                {colecoes.flatMap((c) =>
                  c.itens?.map((item) => (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      key={item.id}
                      onClick={() => {
                        setAvatar(item.link);
                        setAbrirAvatarPicker(false);
                      }}
                      className={`aspect-square rounded-3xl cursor-pointer overflow-hidden border-2 transition-all group relative ${avatar === item.link ? 'border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'border-white/5 hover:border-white/20'}`}
                    >
                      <img src={item.link} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}