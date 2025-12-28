"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

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
  const [apps, setApps] = useState([
    { id: uuidv4(), name: "", cover: "", link: "", stars: 0 }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editApps, setEditApps] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setCategories(data);
  };

  const handleCreateAppChange = (index, field, value) => {
    const updated = [...apps];
    updated[index][field] = value;
    setApps(updated);
  };

  const addCreateApp = () => {
    setApps([...apps, { id: uuidv4(), name: "", cover: "", link: "", stars: 0 }]);
  };

  const createCategory = async () => {
    if (!categoryName) return;

    const id = uuidv4();
    const appsWithIds = apps.map(a => ({ ...a, id: uuidv4() }));

    await setDoc(doc(db, "categories", id), {
      name: categoryName,
      apps: appsWithIds
    });

    setCategories([...categories, { id, name: categoryName, apps: appsWithIds }]);
    setCategoryName("");
    setApps([{ id: uuidv4(), name: "", cover: "", link: "", stars: 0 }]);
  };

  const deleteCategory = async (id) => {
    await deleteDoc(doc(db, "categories", id));
    setCategories(categories.filter(c => c.id !== id));
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditCategoryName(category.name);
    setEditApps(category.apps || []);
  };

  const handleEditAppChange = (index, field, value) => {
    const updated = [...editApps];
    updated[index][field] = value;
    setEditApps(updated);
  };

  const addEditApp = () => {
    setEditApps([
      ...editApps,
      { id: uuidv4(), name: "", cover: "", link: "", stars: 0 }
    ]);
  };

  const deleteEditApp = (id) => {
    setEditApps(editApps.filter(app => app.id !== id));
  };

  const saveEdit = async (id) => {
    const data = {
      name: editCategoryName,
      apps: editApps
    };

    await setDoc(doc(db, "categories", id), data, { merge: true });

    setCategories(categories.map(c => c.id === id ? { id, ...data } : c));
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-green-400 text-center mb-10">
        Painel Administrador HackStore
      </h1>

      <div className="bg-white/10 p-6 rounded-2xl max-w-4xl mx-auto mb-12">
        <input
          value={categoryName}
          onChange={e => setCategoryName(e.target.value)}
          placeholder="Nome da Categoria"
          className="w-full px-3 py-2 rounded text-black mb-4"
        />

        {apps.map((app, i) => (
          <div key={app.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
            <input value={app.name} onChange={e => handleCreateAppChange(i, "name", e.target.value)} placeholder="Nome" className="px-2 py-1 rounded" />
            <input value={app.cover} onChange={e => handleCreateAppChange(i, "cover", e.target.value)} placeholder="Capa URL" className="px-2 py-1 rounded" />
            <input value={app.link} onChange={e => handleCreateAppChange(i, "link", e.target.value)} placeholder="Download" className="px-2 py-1 rounded" />
            <input type="number" value={app.stars} min={0} max={5} onChange={e => handleCreateAppChange(i, "stars", +e.target.value)} className="px-2 py-1 rounded" />
          </div>
        ))}

        <div className="flex gap-3 mt-4">
          <button onClick={addCreateApp} className="bg-blue-500 px-4 py-2 rounded text-black font-bold">
            Adicionar App
          </button>
          <button onClick={createCategory} className="bg-green-500 px-6 py-2 rounded text-black font-bold">
            Criar Categoria
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {categories.map(c => (
          <div key={c.id} className="bg-white/10 p-5 rounded-2xl">
            {editingId === c.id ? (
              <>
                <input
                  value={editCategoryName}
                  onChange={e => setEditCategoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded text-black mb-4"
                />

                {editApps.map((app, i) => (
                  <div key={app.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2 items-center">
                    <input value={app.name} onChange={e => handleEditAppChange(i, "name", e.target.value)} className="px-2 py-1 rounded" />
                    <input value={app.cover} onChange={e => handleEditAppChange(i, "cover", e.target.value)} className="px-2 py-1 rounded" />
                    <input value={app.link} onChange={e => handleEditAppChange(i, "link", e.target.value)} className="px-2 py-1 rounded" />
                    <input type="number" min={0} max={5} value={app.stars} onChange={e => handleEditAppChange(i, "stars", +e.target.value)} className="px-2 py-1 rounded" />
                    <button onClick={() => deleteEditApp(app.id)} className="bg-red-500 px-3 py-1 rounded text-black font-bold">
                      Excluir App
                    </button>
                  </div>
                ))}

                <div className="flex gap-3 mt-4">
                  <button onClick={addEditApp} className="bg-blue-500 px-4 py-2 rounded text-black font-bold">
                    Adicionar App
                  </button>
                  <button onClick={() => saveEdit(c.id)} className="bg-green-500 px-4 py-2 rounded text-black font-bold">
                    Salvar
                  </button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-500 px-4 py-2 rounded text-black font-bold">
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-bold text-green-400">{c.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(c)} className="bg-yellow-400 px-3 py-1 rounded text-black font-bold">
                      Editar
                    </button>
                    <button onClick={() => deleteCategory(c.id)} className="bg-red-500 px-3 py-1 rounded text-black font-bold">
                      Excluir Categoria
                    </button>
                  </div>
                </div>

                {c.apps?.map(app => (
                  <div key={app.id} className="flex justify-between items-center bg-white/10 p-3 rounded mb-2">
                    <div className="flex items-center gap-3">
                      <img src={app.cover} className="w-12 h-12 rounded object-cover" />
                      <span>{app.name}</span>
                    </div>
                    <a href={app.link} target="_blank" className="bg-green-500 px-3 py-1 rounded text-black font-bold">
                      Abrir
                    </a>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
