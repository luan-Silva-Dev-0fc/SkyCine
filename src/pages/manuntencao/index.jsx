"use client";

import { motion } from "framer-motion";
import { FiAlertTriangle, FiShield, FiSettings, FiLock, FiCpu, FiTool } from "react-icons/fi";

export default function Manutencao() {
  const bugsEncontrados = [
    "Instabilidade no Buffer HLS (Erro 403)",
    "Latência na Busca Paralela Firebase",
    "Falha de Decodificação MIME-Type",
    "Vulnerabilidade Cross-Origin (CORS)"
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-x-hidden relative">
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-600/10 blur-[80px] md:blur-[150px] rounded-full animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[95%] md:max-w-2xl bg-white/5 border border-white/10 p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6 border border-red-600/30"
          >
            <FiTool className="text-red-600 text-3xl md:text-4xl" />
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4 px-2">
            Não Estamos <br className="block sm:hidden" />
            <span className="text-red-600">Disponivel</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em]">
            Protocolo de Estabilização SkyNet v2.0
          </p>
        </div>

        <div className="space-y-4 mb-8 md:mb-10">
          <div className="flex items-center gap-3 text-red-600 font-black uppercase text-[10px] md:text-[11px] tracking-widest">
            <FiSettings className="animate-spin" /> Falhas em Correção:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bugsEncontrados.map((bug, index) => (
              <div 
                key={index}
                className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 flex items-center gap-3"
              >
                <span className="text-red-600 font-mono font-bold text-[10px]">0{index + 1}</span>
                <span className="text-zinc-300 font-black uppercase text-[9px] md:text-[10px] tracking-tight md:tracking-wider leading-tight">
                  {bug}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-600/5 border border-red-600/20 p-5 md:p-8 rounded-2xl md:rounded-[2rem] mb-8 md:mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
            <FiShield className="text-red-600 text-lg md:text-xl" />
            <h3 className="font-black uppercase italic text-xs md:text-sm tracking-tighter">Segurança e Integridade</h3>
          </div>
          <p className="text-zinc-400 text-[11px] md:text-[13px] leading-relaxed font-medium italic">
            Informamos que nossa equipe detectou falhas críticas de processamento que podem comprometer a experiência de navegação. 
            Pensando na total segurança e proteção dos nossos usuários, decidimos interromper temporariamente o acesso às páginas de filmes 
            até que todos os módulos de segurança sejam restaurados. Não encaminharemos usuários para áreas instáveis para evitar falhas de carregamento.
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6 opacity-30">
             <FiLock size={12} />
             <div className="h-[1px] w-12 md:w-20 bg-white/20" />
             <FiCpu size={12} />
          </div>
          <p className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] mb-2 px-4 leading-tight">
            Estamos trabalhando intensamente na reconstrução dos módulos afetados.
          </p>
          <p className="text-white font-black uppercase text-[11px] md:text-[13px] tracking-tighter italic">
            Obrigado pela compreensão.
          </p>
        </div>
      </motion.div>

      <div className="fixed bottom-6 md:bottom-10 left-6 md:left-10 opacity-5 pointer-events-none select-none">
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter">SkyCine</h1>
      </div>
    </div>
  );
}