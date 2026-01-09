"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit, Save, X, ChevronDown, LayoutGrid, Link as LinkIcon, Star, Package } from "lucide-react";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.firebasestorage.app",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function AdminPanel() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [apps, setApps] = useState([{ id: uuidv4(), name: "", cover: "", link: "", stars: 0 }]);
  const [editingId, setEditingId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editApps, setEditApps] = useState([]);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleCreateAppChange = (index, field, value) => {
    const updated = [...apps];
    updated[index][field] = value;
    setApps(updated);
  };

  const createCategory = async () => {
    if (!categoryName) return;
    const id = uuidv4();
    const data = { name: categoryName, apps: apps.filter(a => a.name) };
    await setDoc(doc(db, "categories", id), data);
    fetchCategories();
    setCategoryName("");
    setApps([{ id: uuidv4(), name: "", cover: "", link: "", stars: 0 }]);
  };

  const deleteCategory = async (id) => {
    if (confirm("Deseja realmente excluir esta categoria e todos os seus apps?")) {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditCategoryName(category.name);
    setEditApps(category.apps || []);
  };

  const saveEdit = async (id) => {
    const data = { name: editCategoryName, apps: editApps };
    await setDoc(doc(db, "categories", id), data, { merge: true });
    setCategories(categories.map(c => c.id === id ? { id, ...data } : c));
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-slate-200 font-sans pb-20">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0f0f11]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Package className="text-green-500" size={24} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">HACKSTORE <span className="text-green-500">CMS</span></h1>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            v2.4.0 • Admin Mode
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Seção: Criar Nova Categoria */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="text-blue-500" size={20} />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Nova Categoria</h2>
          </div>

          <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-2xl">
            <input
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="Nome da Categoria (ex: Aplicativos Premium)"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 mb-6 focus:ring-2 focus:ring-green-500/50 outline-none transition-all text-white font-medium"
            />

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Apps da Categoria</p>
              {apps.map((app, i) => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={app.id} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input value={app.name} onChange={e => handleCreateAppChange(i, "name", e.target.value)} placeholder="Nome do App" className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500/50" />
                  <input value={app.cover} onChange={e => handleCreateAppChange(i, "cover", e.target.value)} placeholder="URL da Capa" className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500/50" />
                  <input value={app.link} onChange={e => handleCreateAppChange(i, "link", e.target.value)} placeholder="Link de Download" className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500/50" />
                  <div className="flex gap-2">
                    <input type="number" value={app.stars} min={0} max={5} onChange={e => handleCreateAppChange(i, "stars", +e.target.value)} className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm w-full outline-none" />
                    <button onClick={() => setApps(apps.filter(a => a.id !== app.id))} className="p-2 hover:text-red-500 transition-colors"><X size={18}/></button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 mt-8 pt-6 border-t border-white/5">
              <button onClick={() => setApps([...apps, { id: uuidv4(), name: "", cover: "", link: "", stars: 0 }])} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Adicionar outro App
              </button>
              <button onClick={createCategory} className="flex-1 bg-green-500 hover:bg-green-400 text-black font-black py-3 rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> PUBLICAR CATEGORIA
              </button>
            </div>
          </div>
        </section>

        {/* Listagem de Categorias Existentes */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <ChevronDown size={20} className="text-green-500" /> Categorias Ativas
            </h2>
            <span className="text-xs text-slate-500 font-mono">{categories.length} Categorias</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {categories.map(c => (
              <motion.div layout key={c.id} className="bg-[#151518] border border-white/5 rounded-[2rem] overflow-hidden">
                {editingId === c.id ? (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                       <input value={editCategoryName} onChange={e => setEditCategoryName(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white font-bold" />
                       <button onClick={() => saveEdit(c.id)} className="bg-green-500 p-2 rounded-xl text-black"><Save size={20}/></button>
                       <button onClick={() => setEditingId(null)} className="bg-white/10 p-2 rounded-xl text-white"><X size={20}/></button>
                    </div>
                    {editApps.map((app, i) => (
                      <div key={app.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center bg-black/20 p-2 rounded-xl border border-white/5">
                        <input value={app.name} onChange={e => {const u = [...editApps]; u[i].name = e.target.value; setEditApps(u);}} className="bg-transparent px-2 text-sm outline-none" placeholder="Nome" />
                        <input value={app.cover} onChange={e => {const u = [...editApps]; u[i].cover = e.target.value; setEditApps(u);}} className="bg-transparent px-2 text-sm outline-none" placeholder="Capa" />
                        <input value={app.link} onChange={e => {const u = [...editApps]; u[i].link = e.target.value; setEditApps(u);}} className="bg-transparent px-2 text-sm outline-none" placeholder="Link" />
                        <input type="number" value={app.stars} onChange={e => {const u = [...editApps]; u[i].stars = +e.target.value; setEditApps(u);}} className="bg-transparent px-2 text-sm outline-none" />
                        <button onClick={() => setEditApps(editApps.filter(a => a.id !== app.id))} className="text-red-500 hover:bg-red-500/10 p-1 rounded">Remover</button>
                      </div>
                    ))}
                    <button onClick={() => setEditApps([...editApps, {id: uuidv4(), name: "", cover: "", link: "", stars: 0}])} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-xs text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all">+ Novo App nesta edição</button>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">{c.name}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(c)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"><Edit size={18}/></button>
                        <button onClick={() => deleteCategory(c.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {c.apps?.map(app => (
                        <div key={app.id} className="flex items-center gap-3 bg-black/30 p-3 rounded-2xl border border-white/5 group hover:border-green-500/30 transition-all">
                          <img src={app.cover} className="w-12 h-12 rounded-xl object-cover bg-black shadow-lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{app.name}</p>
                            <div className="flex items-center gap-1">
                               <Star size={10} className="fill-yellow-500 text-yellow-500" />
                               <span className="text-[10px] text-slate-500 font-mono">{app.stars}.0</span>
                            </div>
                          </div>
                          <a href={app.link} target="_blank" className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <LinkIcon size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}