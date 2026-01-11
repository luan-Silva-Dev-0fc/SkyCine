"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit3, Save, X, Image as ImageIcon, 
  Layout, FolderPlus, HelpCircle, Info, Sparkles 
} from "lucide-react";

// Configuração Firebase (Mantida conforme original)
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

export default function PainelAdminSkyCine() {
  const [colecoes, setColecoes] = useState([]);
  const [novaColecao, setNovaColecao] = useState({ nome: "", itens: [] });
  const [itemAtual, setItemAtual] = useState({ link: "", categoria: "" });
  const [editarColecao, setEditarColecao] = useState(null);
  const [showHelp, setShowHelp] = useState(null); // Para modais de ajuda
  const [loading, setLoading] = useState(true);

  const carregarColecoes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "colecoes"));
      setColecoes(snap.docs.map(d => ({ idDoc: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarColecoes(); }, []);

  // Adicionar item ao lote de criação
  const adicionarItemAoLote = () => {
    if (!itemAtual.link || !itemAtual.categoria) return;
    setNovaColecao(prev => ({ ...prev, itens: [...prev.itens, itemAtual] }));
    setItemAtual({ link: "", categoria: "" });
  };

  // Salvar nova coleção no banco
  const salvarColecao = async () => {
    if (!novaColecao.nome || novaColecao.itens.length === 0) return;
    await addDoc(collection(db, "colecoes"), novaColecao);
    setNovaColecao({ nome: "", itens: [] });
    carregarColecoes();
  };

  // Função para ADICIONAR FIGURINHA RAPIDAMENTE a uma coleção existente
  const adicionarFigurinhaRapida = async (idDoc, figurinha) => {
    const colecaoAlvo = colecoes.find(c => c.idDoc === idDoc);
    if (!colecaoAlvo) return;
    
    const novosItens = [...colecaoAlvo.itens, figurinha];
    await updateDoc(doc(db, "colecoes", idDoc), { itens: novosItens });
    carregarColecoes();
    setShowHelp(null); // Fecha o modal após adicionar
  };

  const atualizarColecaoCompleta = async () => {
    if (!editarColecao) return;
    await updateDoc(doc(db, "colecoes", editarColecao.idDoc), {
      nome: editarColecao.nome,
      itens: editarColecao.itens
    });
    setEditarColecao(null);
    carregarColecoes();
  };

  const deletarColecao = async (c) => {
    if (!confirm(`Deseja realmente excluir "${c.nome}"?`)) return;
    await deleteDoc(doc(db, "colecoes", c.idDoc));
    carregarColecoes();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      
      {/* BACKGROUND DECORATIVO */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2 tracking-tighter">
            <Sparkles className="text-blue-500" fill="currentColor" /> SKYCINE <span className="text-blue-500">ADMIN</span>
          </h1>
          <p className="text-slate-400 text-sm">Gerenciamento de Figurinhas e Coleções</p>
        </div>
        <button 
          onClick={() => setShowHelp('geral')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all text-xs font-bold mt-4 md:mt-0"
        >
          <HelpCircle size={16} /> COMO USAR?
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: CRIAÇÃO */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[#0f0f11] border border-white/10 p-6 rounded-[2.5rem] shadow-xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <FolderPlus className="text-blue-400" size={20} /> Criar Coleção
            </h3>

            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-bold text-slate-500 mb-1 ml-1 block uppercase">Título da Pasta</label>
                <input
                  type="text"
                  placeholder="Nome da coleção..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-600"
                  value={novaColecao.nome}
                  onChange={(e) => setNovaColecao({ ...novaColecao, nome: e.target.value })}
                />
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-blue-400">ADD FIGURINHA</span>
                  <Info size={14} className="text-slate-600 cursor-pointer" onClick={() => setShowHelp('lote')} />
                </div>
                <input
                  type="text"
                  placeholder="Link da Imagem (URL)"
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-white/20 transition-all"
                  value={itemAtual.link}
                  onChange={(e) => setItemAtual({ ...itemAtual, link: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Categoria (ex: Anime, Memes)"
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm outline-none"
                  value={itemAtual.categoria}
                  onChange={(e) => setItemAtual({ ...itemAtual, categoria: e.target.value })}
                />
                <button
                  onClick={adicionarItemAoLote}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                >
                  + INCLUIR NA LISTA
                </button>
              </div>

              {/* Preview do Lote */}
              {novaColecao.itens.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                  {novaColecao.itens.map((i, idx) => (
                    <div key={idx} className="relative w-12 h-12">
                      <img src={i.link} className="w-full h-full object-cover rounded-lg border border-white/20" />
                      <button 
                        onClick={() => setNovaColecao({ ...novaColecao, itens: novaColecao.itens.filter((_, id) => id !== idx) })}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={salvarColecao}
                disabled={!novaColecao.nome || novaColecao.itens.length === 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:grayscale text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all uppercase tracking-tight"
              >
                Publicar Coleção
              </button>
            </div>
          </div>
        </aside>

        {/* COLUNA DIREITA: LISTAGEM */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layout size={24} className="text-blue-500" /> Suas Coleções
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {colecoes.map((c) => (
                <motion.div
                  key={c.idDoc}
                  layout
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="group bg-[#0f0f11] border border-white/10 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{c.nome}</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowHelp({type: 'add_quick', id: c.idDoc})}
                        className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                        title="Adicionar figurinha rápida"
                      >
                        <Plus size={18} />
                      </button>
                      <button onClick={() => setEditarColecao(c)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => deletarColecao(c)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {c.itens.slice(0, 7).map((img, idx) => (
                      <img key={idx} src={img.link} className="w-full aspect-square object-cover rounded-xl bg-black/40 border border-white/5 shadow-inner" />
                    ))}
                    {c.itens.length > 7 && (
                      <div className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500">
                        +{c.itens.length - 7}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold text-slate-500">{c.itens.length} ARQUIVOS</span>
                    <span className="text-[10px] font-mono text-blue-500/40">SKY-{c.idDoc.slice(0,5).toUpperCase()}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* MODAL DE AJUDA E INTERAÇÃO (MODAIS EDUCATIVOS) */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[#121214] border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            >
              {showHelp === 'geral' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">Como funciona?</h2>
                  <ul className="space-y-4 text-slate-400 text-sm">
                    <li className="flex gap-3"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">1</div> Crie uma coleção dando um nome a ela.</li>
                    <li className="flex gap-3"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">2</div> Adicione links de imagens ou GIFs no lote.</li>
                    <li className="flex gap-3"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">3</div> Clique em "Publicar" para enviar ao SkyCine.</li>
                  </ul>
                </>
              )}

              {typeof showHelp === 'object' && showHelp.type === 'add_quick' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Plus className="text-green-500" /> Adição Rápida
                  </h2>
                  <p className="text-xs text-slate-400">Adicione uma nova figurinha diretamente nesta coleção.</p>
                  <input 
                    type="text" 
                    placeholder="URL da Imagem"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none"
                    id="quick_link"
                  />
                  <input 
                    type="text" 
                    placeholder="Categoria"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none"
                    id="quick_cat"
                  />
                  <button 
                    onClick={() => {
                      const link = document.getElementById('quick_link').value;
                      const cat = document.getElementById('quick_cat').value;
                      if(link && cat) adicionarFigurinhaRapida(showHelp.id, { link, categoria: cat });
                    }}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-500 transition-colors"
                  >
                    CONFIRMAR ADIÇÃO
                  </button>
                </div>
              )}

              <button 
                onClick={() => setShowHelp(null)}
                className="mt-8 w-full py-3 text-slate-500 font-bold hover:text-white transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE EDIÇÃO (MANTIDO E ORGANIZADO) */}
      <AnimatePresence>
        {editarColecao && (
          <motion.div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[150] p-4">
            <motion.div className="bg-[#0f0f11] border border-white/10 p-8 rounded-[3rem] w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-3xl">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <Edit3 className="text-blue-500" /> Gerenciar Coleção
                </h2>
                <button onClick={() => setEditarColecao(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"><X /></button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 mb-2 block tracking-widest uppercase">Nome da Coleção</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all text-xl font-bold"
                    value={editarColecao.nome}
                    onChange={(e) => setEditarColecao({ ...editarColecao, nome: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editarColecao.itens.map((i, idx) => (
                    <div key={idx} className="flex gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 items-center group">
                      <img src={i.link} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                      <div className="flex-1 min-w-0">
                        <input
                          className="w-full bg-transparent text-[10px] text-slate-500 outline-none truncate"
                          value={i.link}
                          onChange={(e) => {
                            const itens = [...editarColecao.itens];
                            itens[idx].link = e.target.value;
                            setEditarColecao({ ...editarColecao, itens });
                          }}
                        />
                        <input
                          className="w-full bg-transparent text-sm text-white font-bold outline-none"
                          value={i.categoria}
                          onChange={(e) => {
                            const itens = [...editarColecao.itens];
                            itens[idx].categoria = e.target.value;
                            setEditarColecao({ ...editarColecao, itens });
                          }}
                        />
                      </div>
                      <button
                        className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
                        onClick={() => {
                          const itens = editarColecao.itens.filter((_, iidx) => iidx !== idx);
                          setEditarColecao({ ...editarColecao, itens });
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-[#0f0f11] pt-6 flex gap-4">
                  <button 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 transition-all"
                    onClick={atualizarColecaoCompleta}
                  >
                    <Save size={20} /> SALVAR ALTERAÇÕES
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