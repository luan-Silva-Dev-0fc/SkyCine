"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiAtSign, FiCamera, FiCheck, FiArrowRight, FiX } from "react-icons/fi";

/* ================= FIREBASE ================= */
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

/* ================= HELPERS ================= */
const gerarUsername = (nome) => `${nome.split(" ")[0]}_${Math.floor(Math.random() * 9999)}`;
const gerarID = (nome) => `${nome.split(" ")[0].toLowerCase()}${Math.floor(Math.random() * 9999)}`;

const carregarColecoes = async () => {
  const snap = await getDocs(collection(db, "colecoes"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/* ================= MAIN ================= */
export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [colecoes, setColecoes] = useState([]);
  const [abrirAvatarPicker, setAbrirAvatarPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/"); return; }
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) { router.replace("/Inicio"); return; }
      setUser(u);
      const data = await carregarColecoes();
      setColecoes(data);
    });
    return () => unsub();
  }, [router]);

  const salvarPerfil = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        nome,
        username: username || gerarUsername(nome),
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

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans">
      {/* Background Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 justify-center">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? "w-8 bg-purple-600" : "w-4 bg-zinc-800"}`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? "w-8 bg-purple-600" : "w-4 bg-zinc-800"}`} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight">Crie sua conta</h2>
                <p className="text-zinc-500 text-sm mt-2">Como você quer ser chamado no SkyCine?</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-600/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>

                <div className="relative group">
                  <FiAtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    placeholder="Username personalizado (opcional)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-600/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>

              <button
                disabled={!nome}
                onClick={() => setStep(2)}
                className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black transition-all shadow-xl shadow-purple-900/10"
              >
                Continuar <FiArrowRight />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight">Escolha seu estilo</h2>
                <p className="text-zinc-500 text-sm mt-2">Selecione um avatar para o seu perfil.</p>
              </div>

              <div className="flex justify-center py-4">
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden"
                  >
                    {avatar ? (
                      <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <FiUser size={40} className="text-zinc-700" />
                    )}
                  </motion.div>
                  <button
                    onClick={() => setAbrirAvatarPicker(true)}
                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg border-4 border-zinc-950 hover:scale-110 transition-transform"
                  >
                    <FiCamera size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-zinc-900 py-4 rounded-2xl font-bold text-zinc-400 hover:text-white transition-all"
                >
                  Voltar
                </button>
                <button
                  disabled={!avatar || loading}
                  onClick={salvarPerfil}
                  className="flex-[2] bg-purple-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20"
                >
                  {loading ? "Salvando..." : <><FiCheck /> Finalizar</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ===== AVATAR PICKER MODAL ===== */}
      <AnimatePresence>
        {abrirAvatarPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAbrirAvatarPicker(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-950 w-full max-w-md p-8 rounded-[3rem] border border-white/10 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase tracking-widest">Avatares</h3>
                <button onClick={() => setAbrirAvatarPicker(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                {colecoes.flatMap((c) =>
                  c.itens?.map((item) => (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      key={item.id}
                      onClick={() => {
                        setAvatar(item.link);
                        setAbrirAvatarPicker(false);
                      }}
                      className="aspect-square rounded-2xl border-2 border-zinc-800 cursor-pointer overflow-hidden hover:border-purple-500 transition-colors shadow-lg"
                    >
                      <img src={item.link} className="w-full h-full object-cover" />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #9333ea; }
      `}</style>
    </div>
  );
}