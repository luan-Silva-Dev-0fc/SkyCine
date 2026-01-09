"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, Save, X, Image as ImageIcon, Layout, FolderPlus } from "lucide-react";

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

export default function PainelAdmin() {
  const [colecoes, setColecoes] = useState([]);
  const [novaColecao, setNovaColecao] = useState({ nome: "", itens: [] });
  const [itemAtual, setItemAtual] = useState({ link: "", categoria: "" });
  const [editarColecao, setEditarColecao] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregarColecoes = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "colecoes"));
    setColecoes(snap.docs.map(d => ({ idDoc: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { carregarColecoes(); }, []);

  const adicionarItem = () => {
    if (!itemAtual.link || !itemAtual.categoria) return;
    setNovaColecao(prev => ({ ...prev, itens: [...prev.itens, itemAtual] }));
    setItemAtual({ link: "", categoria: "" });
  };

  const salvarColecao = async () => {
    if (!novaColecao.nome || novaColecao.itens.length === 0) return;
    await addDoc(collection(db, "colecoes"), novaColecao);
    setNovaColecao({ nome: "", itens: [] });
    carregarColecoes();
  };

  const atualizarColecao = async () => {
    if (!editarColecao || !editarColecao.nome) return;
    await updateDoc(doc(db, "colecoes", editarColecao.idDoc), {
      nome: editarColecao.nome,
      itens: editarColecao.itens
    });
    setEditarColecao(null);
    carregarColecoes();
  };

  const deletarColecao = async (c) => {
    if (!confirm(`Excluir permanentemente a coleção "${c.nome}"?`)) return;
    await deleteDoc(doc(db, "colecoes", c.idDoc));
    carregarColecoes();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-200 p-4 md:p-10 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[120px]" />
      </div>

      <header className="relative z-10 max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <Layout className="text-blue-500" size={36} /> Studio <span className="text-blue-500">Admin</span>
          </h1>
          <p className="text-slate-400 mt-2">Gerencie suas coleções de figurinhas e assets virtuais.</p>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulário de Criação */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <FolderPlus size={20} className="text-green-400" /> Nova Coleção
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nome</label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mt-1"
                  placeholder="Ex: Stickers Engraçados"
                  value={novaColecao.nome}
                  onChange={(e) => setNovaColecao({ ...novaColecao, nome: e.target.value })}
                />
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <p className="text-xs font-bold text-slate-400">ADICIONAR ITEM</p>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-sm focus:outline-none"
                  placeholder="URL da Imagem/GIF"
                  value={itemAtual.link}
                  onChange={(e) => setItemAtual({ ...itemAtual, link: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-sm focus:outline-none"
                  placeholder="Categoria (ex: GIF)"
                  value={itemAtual.categoria}
                  onChange={(e) => setItemAtual({ ...itemAtual, categoria: e.target.value })}
                />
                <button
                  onClick={adicionarItem}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Incluir no lote
                </button>
              </div>

              {/* Lote Temporário */}
              <div className="flex flex-wrap gap-2 py-2">
                {novaColecao.itens.map((i, idx) => (
                  <motion.div initial={{scale:0}} animate={{scale:1}} key={idx} className="relative group">
                    <img src={i.link} className="w-12 h-12 rounded-lg object-cover border border-white/20 shadow-lg" />
                    <button 
                      onClick={() => setNovaColecao({ ...novaColecao, itens: novaColecao.itens.filter((_, index) => index !== idx) })}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={salvarColecao}
                disabled={!novaColecao.nome || novaColecao.itens.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all"
              >
                PUBLICAR COLEÇÃO
              </button>
            </div>
          </div>
        </section>

        {/* Listagem de Coleções */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon size={22} className="text-blue-500" /> Coleções Ativas
            </h2>
            <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
              {colecoes.length} Total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {colecoes.map((c) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={c.idDoc}
                  className="group bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-white/20 transition-all shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg text-white truncate pr-4">{c.nome}</h4>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditarColecao(c)} className="p-2 bg-white/5 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => deletarColecao(c)} className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {c.itens.slice(0, 8).map((i, idx) => (
                      <img key={idx} src={i.link} className="w-full aspect-square object-cover rounded-xl border border-white/5 bg-black/20" />
                    ))}
                    {c.itens.length > 8 && (
                      <div className="w-full aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{c.itens.length - 8}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>{c.itens.length} arquivos</span>
                    <span className="text-blue-500/60">ID: {c.idDoc.slice(0,6)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Modal de Edição */}
      <AnimatePresence>
        {editarColecao && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#121214] border border-white/10 p-8 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-3xl shadow-blue-500/10"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <Edit3 className="text-blue-500" /> Editar Coleção
                </h2>
                <button onClick={() => setEditarColecao(null)} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block">NOME DA COLEÇÃO</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-blue-500"
                    value={editarColecao.nome}
                    onChange={(e) => setEditarColecao({ ...editarColecao, nome: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editarColecao.itens.map((i, idx) => (
                    <div key={idx} className="flex gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 items-center">
                      <img src={i.link} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 space-y-1">
                        <input
                          className="w-full bg-transparent text-[10px] text-slate-400 focus:outline-none border-b border-white/10"
                          value={i.link}
                          onChange={(e) => {
                            const itens = [...editarColecao.itens];
                            itens[idx].link = e.target.value;
                            setEditarColecao({ ...editarColecao, itens });
                          }}
                        />
                        <input
                          className="w-full bg-transparent text-xs text-white focus:outline-none font-bold"
                          value={i.categoria}
                          onChange={(e) => {
                            const itens = [...editarColecao.itens];
                            itens[idx].categoria = e.target.value;
                            setEditarColecao({ ...editarColecao, itens });
                          }}
                        />
                      </div>
                      <button
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        onClick={() => {
                          const itens = editarColecao.itens.filter((_, iidx) => iidx !== idx);
                          setEditarColecao({ ...editarColecao, itens });
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-white/5">
                  <button onClick={() => setEditarColecao(null)} className="px-6 py-3 font-bold text-slate-400 hover:text-white transition-colors">
                    Descartar
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-xl flex items-center gap-2"
                    onClick={atualizarColecao}
                  >
                    <Save size={18} /> ATUALIZAR
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}