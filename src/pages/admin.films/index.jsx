"use client";

import { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilm, FiTv, FiTrash2, FiZap, FiRefreshCw, FiCheckCircle, FiX, FiPlus, FiLayers, FiVideo } from "react-icons/fi";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.firebasestorage.app",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function AdminSkyCine() {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [filmes, setFilmes] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "success" });

  // Estados dos Formulários
  const [formFilme, setFormFilme] = useState({ titulo: "", capa: "", video: "", descricao: "", estrelas: "5.0" });
  const [formSerie, setFormSerie] = useState({ titulo: "", capa: "", descricao: "", temporadas: [] });
  const [tempCapitulo, setTempCapitulo] = useState({ video: "" });

  const loadData = async () => {
    const snap = await getDocs(collection(db, "categorias"));
    setCategorias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadConteudo = async (catId) => {
    if (!catId) return;
    const f = await getDocs(collection(db, "categorias", catId, "filmes"));
    setFilmes(f.docs.map(d => ({ id: d.id, ...d.data() })));
    const s = await getDocs(collection(db, "categorias", catId, "series"));
    setSeries(s.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (selectedCategoria) loadConteudo(selectedCategoria.id); }, [selectedCategoria]);

  const showStatus = (title, message, type = "success") => {
    setModal({ show: true, title, message, type });
    setTimeout(() => setModal(prev => ({ ...prev, show: false })), 3000);
  };

  // --- LÓGICA DE PERSISTÊNCIA (PUSH / PUT GLOBAL) ---
  const saveToFirebase = async (id, dados, tipo) => {
    const payload = { ...dados, id, id_referencia: id, tipo, categoriaId: selectedCategoria.id, atualizadoEm: new Date().toISOString() };
    const pasta = tipo === 'filme' ? 'filmes' : 'series';
    
    // 1. Salva na Subcoleção da Categoria (Organização)
    await setDoc(doc(db, "categorias", selectedCategoria.id, pasta, id), payload);
    // 2. Salva na Coleção Mestre (Busca Rápida do Player)
    await setDoc(doc(db, "todos_os_conteudos", id), payload);
  };

  const handleCriarFilme = async () => {
    if (!formFilme.titulo || !formFilme.video) return showStatus("Erro", "Preencha o título e o vídeo", "error");
    setLoading(true);
    const novoId = `FILME-${1000 + filmes.length + 1}`;
    await saveToFirebase(novoId, formFilme, 'filme');
    setFormFilme({ titulo: "", capa: "", video: "", descricao: "", estrelas: "5.0" });
    loadConteudo(selectedCategoria.id);
    showStatus("Sucesso", "Filme adicionado ao catálogo global!");
    setLoading(false);
  };

  // --- GESTÃO DE SÉRIES (TEMPORADAS E CAPÍTULOS) ---
  const addTemporada = () => {
    const novaTemp = {
      nome: `Temporada ${formSerie.temporadas.length + 1}`,
      capa: "",
      capitulos: []
    };
    setFormSerie({ ...formSerie, temporadas: [...formSerie.temporadas, novaTemp] });
  };

  const addCapitulo = (indexTemp) => {
    if (!tempCapitulo.video) return;
    const novasTemps = [...formSerie.temporadas];
    novasTemps[indexTemp].capitulos.push({
      ordem: novasTemps[indexTemp].capitulos.length + 1,
      video: tempCapitulo.video,
      titulo: `Episódio ${novasTemps[indexTemp].capitulos.length + 1}`
    });
    setFormSerie({ ...formSerie, temporadas: novasTemps });
    setTempCapitulo({ video: "" });
  };

  const handleCriarSerie = async () => {
    if (!formSerie.titulo || formSerie.temporadas.length === 0) return showStatus("Erro", "Série precisa de título e temporadas", "error");
    setLoading(true);
    const novoId = `SERIE-${2000 + series.length + 1}`;
    await saveToFirebase(novoId, formSerie, 'serie');
    setFormSerie({ titulo: "", capa: "", descricao: "", temporadas: [] });
    loadConteudo(selectedCategoria.id);
    showStatus("Sucesso", "Série publicada com sucesso!");
    setLoading(false);
  };

  const deletarItem = async (id, tipo) => {
    if (!confirm("Excluir conteúdo de todas as bases?")) return;
    const pasta = tipo === 'filme' ? 'filmes' : 'series';
    await deleteDoc(doc(db, "categorias", selectedCategoria.id, pasta, id));
    await deleteDoc(doc(db, "todos_os_conteudos", id));
    loadConteudo(selectedCategoria.id);
    showStatus("Removido", "Conteúdo apagado permanentemente.");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 border-b border-white/5 pb-10">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">SKY<span className="text-red-600">HUB</span></h1>
          <div className="flex flex-wrap gap-2">
            {categorias.map(c => (
              <button key={c.id} onClick={() => setSelectedCategoria(c)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategoria?.id === c.id ? "bg-red-600 text-white shadow-xl shadow-red-600/30" : "bg-zinc-900 text-zinc-600 hover:text-white"}`}>{c.nome}</button>
            ))}
          </div>
        </header>

        {selectedCategoria && (
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* SEÇÃO FILMES */}
            <div className="space-y-8">
              <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem]">
                <h2 className="text-white font-black uppercase text-xs mb-6 flex items-center gap-2"><FiFilm className="text-red-600"/> Upload de Filme</h2>
                <div className="space-y-4">
                  <input placeholder="Título do Filme" value={formFilme.titulo} onChange={e => setFormFilme({...formFilme, titulo: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:border-red-600 transition-all" />
                  <input placeholder="URL do Vídeo Direct Link" value={formFilme.video} onChange={e => setFormFilme({...formFilme, video: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:border-red-600 transition-all" />
                  <button onClick={handleCriarFilme} disabled={loading} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-white/5">Publicar Filme</button>
                </div>
              </div>

              <div className="space-y-3">
                {filmes.map(f => (
                  <div key={f.id} className="bg-zinc-900/80 p-5 rounded-[1.5rem] flex items-center justify-between group border border-transparent hover:border-red-600/20 transition-all">
                    <div><p className="text-white font-bold text-sm italic uppercase">{f.titulo}</p><p className="text-[9px] font-mono text-zinc-600">{f.id}</p></div>
                    <button onClick={() => deletarItem(f.id, 'filme')} className="p-3 text-zinc-700 hover:text-red-600 transition-all"><FiTrash2/></button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO SÉRIES */}
            <div className="space-y-8">
              <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem]">
                <h2 className="text-white font-black uppercase text-xs mb-6 flex items-center gap-2"><FiTv className="text-red-600"/> Gerenciador de Séries</h2>
                <div className="space-y-4">
                  <input placeholder="Título da Série" value={formSerie.titulo} onChange={e => setFormSerie({...formSerie, titulo: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:border-red-600 transition-all" />
                  
                  {/* Temporadas Dinâmicas */}
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                    {formSerie.temporadas.map((temp, tIdx) => (
                      <div key={tIdx} className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black text-white uppercase italic">{temp.nome}</span>
                           <span className="text-[9px] text-zinc-600">{temp.capitulos.length} Capítulos</span>
                        </div>
                        <input placeholder="URL Capa da Temporada" className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-[10px] mb-4 outline-none focus:border-red-600" onChange={e => {
                          const n = [...formSerie.temporadas]; n[tIdx].capa = e.target.value; setFormSerie({...formSerie, temporadas: n});
                        }} />
                        
                        <div className="flex gap-2 mb-4">
                          <input placeholder="Link do Vídeo" value={tempCapitulo.video} onChange={e => setTempCapitulo({video: e.target.value})} className="flex-1 bg-zinc-900 border border-white/5 rounded-xl p-3 text-[10px] outline-none" />
                          <button onClick={() => addCapitulo(tIdx)} className="bg-red-600/20 text-red-600 px-4 rounded-xl text-xs hover:bg-red-600 hover:text-white transition-all"><FiPlus/></button>
                        </div>

                        <div className="space-y-1">
                           {temp.capitulos.map((cap, cIdx) => (
                             <div key={cIdx} className="flex items-center gap-2 text-[9px] text-zinc-500 font-mono bg-black/20 p-2 rounded-lg">
                               <FiVideo /> Cap. {cap.ordem} - {cap.video.substring(0,20)}...
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={addTemporada} className="flex-1 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-white/5 transition-all">+ Temporada</button>
                    <button onClick={handleCriarSerie} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20">Publicar Série</button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {series.map(s => (
                  <div key={s.id} className="bg-zinc-900/80 p-5 rounded-[1.5rem] flex items-center justify-between group border border-transparent hover:border-red-600/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-10 bg-zinc-800 rounded-md overflow-hidden border border-white/5"><img src={s.capa} className="w-full h-full object-cover" /></div>
                      <div><p className="text-white font-bold text-sm italic uppercase">{s.titulo}</p><p className="text-[9px] font-mono text-zinc-600">{s.id} • {s.temporadas.length} Temps</p></div>
                    </div>
                    <button onClick={() => deletarItem(s.id, 'serie')} className="p-3 text-zinc-700 hover:text-red-600 transition-all"><FiTrash2/></button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* MODAL DE STATUS */}
      <AnimatePresence>
        {modal.show && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-10 right-10 z-[100]">
            <div className={`bg-zinc-900 border-l-4 ${modal.type === 'success' ? 'border-emerald-500' : 'border-red-600'} p-6 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]`}>
              {modal.type === 'success' ? <FiCheckCircle className="text-emerald-500 text-2xl"/> : <FiX className="text-red-600 text-2xl"/>}
              <div>
                <p className="text-white font-black uppercase text-[10px] tracking-widest">{modal.title}</p>
                <p className="text-zinc-500 text-[10px]">{modal.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
}