"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, deleteUser } from "firebase/auth";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
import { FiTrash2, FiAlertTriangle, FiShieldOff, FiArrowLeft } from "react-icons/fi";

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

/* ================= COMPONENTES ================= */

function Modal({ children, icon: Icon, title, color = "red" }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-950 w-full max-w-sm p-8 rounded-[2.5rem] border border-zinc-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {color === "red" && <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />}
        <div className="flex flex-col items-center">
          {Icon && (
            <div className={`p-4 rounded-full bg-${color}-500/10 text-${color}-500 mb-4`}>
              <Icon size={32} />
            </div>
          )}
          <h3 className="text-2xl font-bold text-white mb-2 text-center">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN ================= */

export default function Perfil() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [confirmarDelete, setConfirmarDelete] = useState(false);
  const [avisoFinal, setAvisoFinal] = useState(false);
  const [processandoDelete, setProcessandoDelete] = useState(false);
  const [codigoAnimado, setCodigoAnimado] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/");
        return;
      }
      setFirebaseUser(u);
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setPerfil(snap.data());
    });
    return () => unsub();
  }, [router]);

  const animarDelecao = async () => {
    const linhas = [
      "AUTH_REVOKE_SESSION",
      "FIRESTORE_PURGE_UID",
      "WIPING_USER_METADATA",
      "ENCRYPTING_EXIT_LOGS",
      "TERMINATING_SESSIONS",
      "CLEANING_CACHE_REFS"
    ];
    const duracao = 16000;
    const inicio = Date.now();
    while (Date.now() - inicio < duracao) {
      setCodigoAnimado(linhas[Math.floor(Math.random() * linhas.length)] + "...");
      await new Promise((r) => setTimeout(r, 600));
    }
  };

  const deletarContaDeVerdade = async () => {
    if (!firebaseUser) return;
    try {
      await deleteDoc(doc(db, "users", firebaseUser.uid));
      await deleteUser(firebaseUser);
      router.replace("/");
    } catch (err) {
      console.error(err);
      alert("Sua sessão expirou por segurança. Faça login novamente para deletar a conta.");
      setProcessandoDelete(false);
    }
  };

  if (!perfil) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 selection:bg-red-500">
      
      {/* Botão Voltar */}
      <button 
        onClick={() => router.back()}
        className="absolute top-8 left-8 p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
      >
        <FiArrowLeft size={20} />
      </button>

      {/* Card de Perfil */}
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="relative bg-zinc-950 rounded-[3rem] border border-zinc-800 p-8 shadow-2xl overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-[80px]" />
          
          <div className="relative flex flex-col items-center">
            {/* Avatar aprimorado */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20" />
              <div
                className="w-32 h-32 rounded-[2.5rem] border-2 border-zinc-800 bg-zinc-900 p-1 relative z-10 shadow-inner"
              >
                <div 
                  className="w-full h-full rounded-[2rem] bg-cover bg-center"
                  style={{ backgroundImage: perfil.avatar ? `url(${perfil.avatar})` : 'none' }}
                />
              </div>
            </div>

            <h2 className="text-3xl font-black tracking-tight">{perfil.nome}</h2>
            {perfil.username && (
              <p className="text-zinc-500 font-medium tracking-wide mt-1">@{perfil.username}</p>
            )}

            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-10" />

            <div className="w-full space-y-4">
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Status da Conta</p>
                <p className="text-sm font-semibold text-emerald-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Ativa e Protegida
                </p>
              </div>

              <button
                onClick={() => setConfirmarDelete(true)}
                className="w-full group bg-transparent hover:bg-red-600/10 border border-red-900/30 hover:border-red-600 py-4 rounded-2xl font-bold text-red-500 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <FiTrash2 className="group-hover:rotate-12 transition-transform" />
                Deletar minha conta
              </button>
            </div>
          </div>
        </div>
        <p className="text-center mt-8 text-zinc-600 text-xs font-medium uppercase tracking-tighter">
          SkyCine &copy; 2025 • Gestão de Privacidade
        </p>
      </div>

      {/* Modais com design unificado */}
      {confirmarDelete && (
        <Modal title="Você tem certeza?" icon={FiAlertTriangle} color="orange">
          <p className="text-zinc-400 text-center mb-8 leading-relaxed">
            Sua conta será marcada para exclusão imediata. Seus dados de perfil serão perdidos.
          </p>
          <div className="flex w-full gap-3">
            <button onClick={() => setConfirmarDelete(false)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 py-4 rounded-2xl font-bold text-sm transition-all">Manter conta</button>
            <button onClick={() => { setConfirmarDelete(false); setAvisoFinal(true); }} className="flex-1 bg-orange-600 hover:bg-orange-700 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-orange-900/20">Continuar</button>
          </div>
        </Modal>
      )}

      {avisoFinal && (
        <Modal title="Ação Irreversível" icon={FiShieldOff} color="red">
          <p className="text-zinc-400 text-center mb-8 leading-relaxed">
            Confirmando isso, apagaremos seu login <strong>({perfil.username})</strong> e todos os registros permanentemente.
          </p>
          <div className="flex w-full gap-3">
            <button onClick={() => setAvisoFinal(false)} className="flex-1 bg-zinc-900 py-4 rounded-2xl font-bold text-sm">Voltar</button>
            <button 
              onClick={async () => {
                setAvisoFinal(false);
                setProcessandoDelete(true);
                await animarDelecao();
                await deletarContaDeVerdade();
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-900/40"
            >
              Confirmar Exclusão
            </button>
          </div>
        </Modal>
      )}

      {processandoDelete && (
        <Modal title="Limpando Dados" color="red">
          <div className="w-full space-y-6 flex flex-col items-center">
            <div className="w-full bg-black rounded-3xl p-6 font-mono text-[10px] text-red-500 border border-red-900/30 min-h-[100px] flex items-center justify-center text-center leading-relaxed">
              <span className="animate-pulse">{codigoAnimado}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-1 border-2 border-zinc-800 border-t-red-600 rounded-full animate-spin" />
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Não feche esta janela</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}