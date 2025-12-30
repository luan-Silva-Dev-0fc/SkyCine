"use client";

import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Configurações MANTIDAS
const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.appspot.com",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const frases = [
  "O melhor do cinema na sua tela",
  "Experiência 4K sem interrupções",
  "Sua pipoca merece esse player",
  "Milhares de títulos a um clique",
  "A evolução do seu streaming pessoal",
];

const imagensFundo = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2000",
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000",
];

function Modal() {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-md animate-in fade-in duration-700">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-t-4 border-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-t-4 border-white/20 rounded-full animate-spin-slow"></div>
        </div>
        <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic">Preparando Sala...</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Sincronizando Metadados 4K</p>
      </div>
    </div>
  );
}

export default function SkyCineLogin() {
  const [fraseAtual, setFraseAtual] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    const intervalFrase = setInterval(() => setFraseAtual((p) => (p + 1) % frases.length), 4000);
    const intervalImg = setInterval(() => setImagemAtual((p) => (p + 1) % imagensFundo.length), 6000);
    return () => { clearInterval(intervalFrase); clearInterval(intervalImg); };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setShowModal(true);
      setTimeout(() => window.location.replace("/Home"), 2500);
    } catch {
      alert("Erro ao autenticar no servidor SkyCine.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505] font-sans">
      
      {/* Background Cinematográfico com Movimento Ken Burns */}
      <div className="absolute inset-0 z-0">
        {imagensFundo.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[4000ms] ease-in-out ${
              index === imagemAtual ? "opacity-30 scale-110 translate-x-2" : "opacity-0 scale-100 translate-x-0"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        {/* Camadas de Profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent" />
        
        {/* Partículas de "Poeira de Projetor" */}
        <div className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="particle" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3}px`,
                    height: `${Math.random() * 3}px`,
                    animationDelay: `${Math.random() * 8}s`,
                    animationDuration: `${10 + Math.random() * 10}s`
                }} />
            ))}
        </div>
      </div>

      {/* Interface de Login Centralizada */}
      <div className="relative z-10 w-full max-w-[400px] px-6">
        
        {/* Logo SkyCine de Alto Impacto */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
           <div className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-sm mb-4">Original</div>
           <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
             Sky<span className="text-red-600">Cine</span>
           </h1>
           <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-[1px] w-8 bg-zinc-800" />
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Entertainment Platform</p>
              <div className="h-[1px] w-8 bg-zinc-800" />
           </div>
        </div>

        {/* Card de Ação */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative group overflow-hidden">
          {/* Brilho interno sutil */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-[80px] group-hover:bg-red-600/20 transition-all duration-700" />
          
          <div className="relative z-10 space-y-8">
            <div className="h-10 flex items-center justify-center text-center">
               <p className="text-sm font-medium text-zinc-300 italic animate-pulse">
                 "{frases[fraseAtual]}"
               </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.4)] uppercase text-[11px] tracking-widest"
            >
              <FcGoogle size={22} />
              Iniciar Sessão
            </button>

            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between px-2">
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Qualidade</span>
                  <span className="text-[9px] text-emerald-500 font-bold uppercase">Ultra HD 4K</span>
               </div>
               <div className="w-full h-[2px] bg-zinc-900 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-red-600/40 animate-pulse" />
               </div>
            </div>
          </div>
        </div>

        {/* Info de Rodapé */}
        <div className="mt-10 flex flex-col items-center gap-4 opacity-50">
           <div className="flex items-center gap-6">
              <span className="text-[10px] text-white font-bold tracking-tighter uppercase">Netflix Style</span>
              <span className="text-[10px] text-white font-bold tracking-tighter uppercase">No Ads</span>
              <span className="text-[10px] text-white font-bold tracking-tighter uppercase">Daily Updates</span>
           </div>
           <p className="text-[8px] text-zinc-600 font-medium tracking-[0.2em] text-center">
             © 2025 SKYCINE • DESENVOLVIDO PARA CINÉFILOS
           </p>
        </div>
      </div>

      {showModal && <Modal />}

      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { transform: translate(20px, -100vh); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .particle {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: float infinite linear;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        /* Responsividade para telas muito pequenas */
        @media (max-width: 400px) {
          h1 { font-size: 3rem !important; }
          .p-8 { padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}