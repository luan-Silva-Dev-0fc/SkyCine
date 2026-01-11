"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiFilm, FiTv, FiTrash2, FiPlus, FiVideo, FiImage, 
  FiHelpCircle, FiInfo, FiCheckCircle, FiX, FiAlertCircle 
} from "react-icons/fi";

// Configuração Firebase (Mantenha a sua original)
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
  const [showHelp, setShowHelp] = useState(false);
  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "success" });

  // Estados dos Formulários
  const [formFilme, setFormFilme] = useState({ titulo: "", capa: "", video: "", descricao: "", estrelas: "5.0" });
  const [formSerie, setFormSerie] = useState({ titulo: "", capa: "", descricao: "", temporadas: [] });
  const [tempCapitulo, setTempCapitulo] = useState({ video: "" });

  const loadData = async () => {
    const snap = await getDocs(collection(db, "categorias"));
    const cats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCategorias(cats);
    if(cats.length > 0) setSelectedCategoria(cats[0]);
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

  const saveToFirebase = async (id, dados, tipo) => {
    const payload = { ...dados, id, id_referencia: id, tipo, categoriaId: selectedCategoria.id, atualizadoEm: new Date().toISOString() };
    const pasta = tipo === 'filme' ? 'filmes' : 'series';
    await setDoc(doc(db, "categorias", selectedCategoria.id, pasta, id), payload);
    await setDoc(doc(db, "todos_os_conteudos", id), payload);
  };

  const handleCriarFilme = async () => {
    if (!formFilme.titulo || !formFilme.video || !formFilme.capa) 
      return showStatus("Erro", "Preencha Título, Capa e Vídeo", "error");
    
    setLoading(true);
    const novoId = `FILME-${Date.now()}`;
    await saveToFirebase(novoId, formFilme, 'filme');
    setFormFilme({ titulo: "", capa: "", video: "", descricao: "", estrelas: "5.0" });
    loadConteudo(selectedCategoria.id);
    showStatus("Sucesso", "Filme publicado no catálogo!");
    setLoading(false);
  };

  // Funções de Série (Similares à sua original, mas mantendo a estrutura)
  const addTemporada = () => {
    const novaTemp = { nome: `Temporada ${formSerie.temporadas.length + 1}`, capa: "", capitulos: [] };
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
    if (!formSerie.titulo || formSerie.temporadas.length === 0) 
        return showStatus("Erro", "Série precisa de título e temporadas", "error");
    setLoading(true);
    const novoId = `SERIE-${Date.now()}`;
    await saveToFirebase(novoId, formSerie, 'serie');
    setFormSerie({ titulo: "", capa: "", descricao: "", temporadas: [] });
    loadConteudo(selectedCategoria.id);
    showStatus("Sucesso", "Série publicada!");
    setLoading(false);
  };

  const deletarItem = async (id, tipo) => {
    if (!confirm("Excluir permanentemente?")) return;
    const pasta = tipo === 'filme' ? 'filmes' : 'series';
    await deleteDoc(doc(db, "categorias", selectedCategoria.id, pasta, id));
    await deleteDoc(doc(db, "todos_os_conteudos", id));
    loadConteudo(selectedCategoria.id);
    showStatus("Removido", "Conteúdo apagado.");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-4 lg:p-10 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-white italic tracking-tighter">SKY<span className="text-red-600">HUB</span></h1>
            <span className="bg-zinc-800 text-[9px] px-2 py-1 rounded text-zinc-500 font-bold tracking-widest uppercase">Admin Panel</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {categorias.map(c => (
              <button 
                key={c.id} 
                onClick={() => setSelectedCategoria(c)} 
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategoria?.id === c.id ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-500"}`}
              >
                {c.nome}
              </button>
            ))}
          </div>
        </header>

        {selectedCategoria && (
          <div className="grid lg:grid-cols-2 gap-10">
            
            {/* COLUNA FILMES */}
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-black uppercase text-[11px] flex items-center gap-2"><FiFilm className="text-red-600"/> Adicionar Filme</h2>
                    {formFilme.capa && <img src={formFilme.capa} className="w-8 h-12 object-cover rounded shadow-lg border border-white/10" alt="Preview" />}
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <FiInfo className="absolute right-4 top-4 text-zinc-700" />
                    <input placeholder="Título do Filme" value={formFilme.titulo} onChange={e => setFormFilme({...formFilme, titulo: e.target.value})} className="input-field" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="URL da Capa (JPG/PNG)" value={formFilme.capa} onChange={e => setFormFilme({...formFilme, capa: e.target.value})} className="input-field" />
                    <input placeholder="URL do Vídeo (MP4/HLS)" value={formFilme.video} onChange={e => setFormFilme({...formFilme, video: e.target.value})} className="input-field" />
                  </div>

                  <textarea placeholder="Pequena descrição..." value={formFilme.descricao} onChange={e => setFormFilme({...formFilme, descricao: e.target.value})} className="input-field h-20 resize-none" />
                  
                  <button onClick={handleCriarFilme} disabled={loading} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">
                    {loading ? "Processando..." : "Publicar Filme"}
                  </button>
                </div>
              </div>

              {/* LISTA DE FILMES */}
              <div className="grid grid-cols-1 gap-2">
                {filmes.map(f => (
                  <div key={f.id} className="bg-zinc-900/40 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-white/5 transition-all">
                    <div className="flex items-center gap-4">
                        <img src={f.capa} className="w-10 h-14 object-cover rounded-lg bg-zinc-800" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase italic">{f.titulo}</p>
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">{f.id}</p>
                        </div>
                    </div>
                    <button onClick={() => deletarItem(f.id, 'filme')} className="p-3 text-zinc-700 hover:text-red-600 transition-all"><FiTrash2/></button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUNA SÉRIES */}
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2.5rem]">
                <h2 className="text-white font-black uppercase text-[11px] mb-6 flex items-center gap-2"><FiTv className="text-red-600"/> Gerenciar Séries</h2>
                
                <div className="space-y-4">
                  <input placeholder="Título da Série" value={formSerie.titulo} onChange={e => setFormSerie({...formSerie, titulo: e.target.value})} className="input-field" />
                  <input placeholder="URL da Capa Principal" value={formSerie.capa} onChange={e => setFormSerie({...formSerie, capa: e.target.value})} className="input-field" />
                  
                  {/* TEMPORADAS */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scroll">
                    {formSerie.temporadas.map((temp, tIdx) => (
                      <div key={tIdx} className="bg-black/40 p-5 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                           <span className="text-[10px] font-black text-white uppercase italic">{temp.nome}</span>
                           <span className="bg-red-600/10 text-red-500 text-[8px] px-2 py-0.5 rounded-full font-bold">{temp.capitulos.length} EPS</span>
                        </div>
                        
                        <input placeholder="Capa da Temporada (Opcional)" className="input-field text-[10px] mb-3 bg-zinc-900" onChange={e => {
                          const n = [...formSerie.temporadas]; n[tIdx].capa = e.target.value; setFormSerie({...formSerie, temporadas: n});
                        }} />
                        
                        <div className="flex gap-2">
                          <input placeholder="Link do Vídeo" value={tempCapitulo.video} onChange={e => setTempCapitulo({video: e.target.value})} className="input-field text-[10px] flex-1 bg-zinc-900" />
                          <button onClick={() => addCapitulo(tIdx)} className="bg-zinc-800 text-white px-4 rounded-xl hover:bg-red-600 transition-all"><FiPlus/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={addTemporada} className="flex-1 bg-zinc-800 text-zinc-400 py-4 rounded-2xl text-[10px] font-black uppercase hover:text-white transition-all">+ Temp</button>
                    <button onClick={handleCriarSerie} className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20 hover:scale-[1.02] transition-transform">Publicar Série</button>
                  </div>
                </div>
              </div>

              {/* LISTA DE SÉRIES */}
              <div className="grid grid-cols-1 gap-2">
                {series.map(s => (
                  <div key={s.id} className="bg-zinc-900/40 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <img src={s.capa} className="w-10 h-14 object-cover rounded-lg bg-zinc-800" />
                      <div>
                        <p className="text-white font-bold text-xs uppercase italic">{s.titulo}</p>
                        <p className="text-[9px] font-mono text-zinc-600">{s.temporadas.length} TEMPORADAS</p>
                      </div>
                    </div>
                    <button onClick={() => deletarItem(s.id, 'serie')} className="p-3 text-zinc-700 hover:text-red-600 transition-all"><FiTrash2/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTÃO DE AJUDA FLUTUANTE */}
      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 left-6 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:bg-red-600 hover:text-white transition-all z-50"
      >
        <FiHelpCircle size={24} />
      </button>

      {/* MODAL DE AJUDA / TUTORIAL */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] max-w-lg w-full relative"
            >
              <button onClick={() => setShowHelp(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><FiX size={24}/></button>
              
              <h3 className="text-2xl font-black text-white italic mb-6">COMO USAR O <span className="text-red-600">SKYHUB</span></h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">1</div>
                  <p className="text-sm text-zinc-400"><strong className="text-white">Selecione a Categoria:</strong> Antes de tudo, clique no menu superior para escolher onde o conteúdo será listado (Ação, Terror, etc).</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">2</div>
                  <p className="text-sm text-zinc-400"><strong className="text-white">Filmes:</strong> Insira o título, o link da imagem da capa e o link direto do vídeo. Clique em Publicar.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">3</div>
                  <p className="text-sm text-zinc-400"><strong className="text-white">Séries:</strong> Crie uma temporada primeiro. Dentro dela, cole o link do vídeo e clique no <span className="text-white">+</span> para adicionar o episódio.</p>
                </div>
              </div>

              <button onClick={() => setShowHelp(false)} className="w-full mt-8 bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Entendi, vamos lá!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK STATUS */}
      <AnimatePresence>
        {modal.show && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="fixed bottom-10 right-10 z-[100]">
            <div className={`bg-zinc-900 border border-white/5 p-5 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[320px]`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${modal.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-600/20 text-red-600'}`}>
                {modal.type === 'success' ? <FiCheckCircle size={20}/> : <FiAlertCircle size={20}/>}
              </div>
              <div>
                <p className="text-white font-black uppercase text-[10px] tracking-tighter">{modal.title}</p>
                <p className="text-zinc-500 text-[10px]">{modal.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .input-field {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 1.25rem;
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #dc2626;
          background: rgba(0,0,0,0.5);
        }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
}