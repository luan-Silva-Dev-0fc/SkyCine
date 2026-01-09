"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Versão mais estável para App Router
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Download, Star, ChevronLeft, Terminal, Cpu } from "lucide-react";
import Link from "next/link";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.firebasestorage.app",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

export default function AppPage() {
  const params = useParams();
  const id = params?.id;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [appData, setAppData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchApp = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      let foundApp = null;

      for (const catDoc of snapshot.docs) {
        const apps = catDoc.data().apps || [];
        const match = apps.find(a => String(a.appId || a.id) === String(id));
        if (match) {
          foundApp = match;
          break;
        }
      }
      if (foundApp) setAppData(foundApp);
    };

    fetchApp();
  }, [id, db]);

  const handleDownload = () => {
    if (!appData) return;

    setIsDownloading(true);
    setStep(1);
    
    // Inicia o download real
    setTimeout(() => {
        window.location.href = appData.link;
    }, 1500);

    // Sequência de animação do "Terminal"
    setTimeout(() => setStep(2), 1000);
    setTimeout(() => setStep(3), 3000);
    setTimeout(() => {
      setIsDownloading(false);
      setStep(0);
    }, 6000);
  };

  if (!appData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-green-400">
        <Cpu className="animate-spin mb-4" size={40} />
        <p className="font-mono tracking-widest animate-pulse">DECRYPTING_DATA...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 font-sans">
      {/* Background Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Botão Voltar */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para Store</span>
        </Link>

        {/* Hero Section do App */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Download size={120} />
          </div>

          <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={appData.cover}
              alt={appData.name}
              className="w-40 h-40 md:w-56 md:h-56 rounded-[2rem] object-cover shadow-2xl border border-white/10"
            />

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-green-500/20">
                  Verificado
                </span>
                <span className="bg-white/5 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                  v2.4.0
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
                {appData.name}
              </h1>

              <div className="flex justify-center md:justify-start items-center mb-6 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} size={18} 
                    className={i < (appData.stars || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"} 
                  />
                ))}
                <span className="text-gray-500 ml-2 text-sm font-medium">({appData.stars}.0)</span>
              </div>

              <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                Obtenha a versão completa com todos os recursos desbloqueados. 
                Nossa infraestrutura garante um download criptografado e livre de ameaças.
              </p>

              <button
                onClick={handleDownload}
                className="group relative w-full md:w-auto inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-black font-black px-10 py-5 rounded-2xl shadow-[0_10px_30px_-10px_rgba(34,197,94,0.5)] transition-all active:scale-95"
              >
                <Download size={20} className="group-hover:bounce" />
                INSTALAR AGORA
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recursos Extras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: <ShieldCheck className="text-green-400" />, title: "Segurança Total", desc: "Varredura em tempo real contra malwares." },
            { icon: <Cpu className="text-blue-400" />, title: "Otimizado", desc: "Consumo mínimo de bateria e processamento." },
            { icon: <Terminal className="text-purple-400" />, title: "Versão Pro", desc: "Acesso a todas as ferramentas premium." }
          ].map((item, i) => (
            <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-3xl">
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Download Hacker */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-green-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_-10px_rgba(34,197,94,0.2)]"
            >
              {/* Barra de título do Terminal */}
              <div className="bg-[#111] px-6 py-3 border-b border-white/5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-4 font-mono text-xs text-gray-500 uppercase tracking-widest">System_Installer.exe</span>
              </div>

              <div className="p-8 font-mono space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <img src={appData.cover} className="w-full h-full rounded-xl object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                  <div>
                    <p className="text-green-400 text-lg font-bold">PREPARANDO PACOTES...</p>
                    <p className="text-gray-500 text-xs">Estabelecendo conexão segura com o servidor...</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {step >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="bg-black p-5 rounded-xl border border-white/5 text-sm text-green-500/80 space-y-1"
                    >
                      <p className="">{`> Verificando integridade dos arquivos... OK`}</p>
                      <p className="">{`> Ignorando protocolos de restrição... OK`}</p>
                      <p className="animate-pulse">{`> Injetando binários no sistema...`}</p>
                      <p className="text-white font-bold">{`> ACESSO CONCEDIDO: ${appData.name.toUpperCase()}`}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {step >= 3 && (
                   <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-4"
                   >
                     <p className="text-green-400 text-2xl font-black italic animate-bounce">
                       DOWNLOAD INICIADO! 🚀
                     </p>
                     <p className="text-gray-500 text-xs mt-2">Verifique sua barra de notificações.</p>
                   </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}