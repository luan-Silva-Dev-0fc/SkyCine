"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

// Firebase config
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
  // ---- Coleções de figurinhas ----
  const [colecoes, setColecoes] = useState([]);
  const [novaColecao, setNovaColecao] = useState({ nome: "", itens: [] });
  const [itemAtual, setItemAtual] = useState({ link: "", categoria: "" });
  const [editarColecao, setEditarColecao] = useState(null);

  // Carregar coleções do Firestore
  const carregarColecoes = async () => {
    const snap = await getDocs(collection(db, "colecoes"));
    setColecoes(snap.docs.map(d => ({ idDoc: d.id, ...d.data() })));
  };

  useEffect(() => {
    carregarColecoes();
  }, []);

  // Adicionar item à coleção atual
  const adicionarItem = () => {
    if (!itemAtual.link || !itemAtual.categoria) return;
    setNovaColecao(prev => ({ ...prev, itens: [...prev.itens, itemAtual] }));
    setItemAtual({ link: "", categoria: "" });
  };

  // Salvar nova coleção
  const salvarColecao = async () => {
    if (!novaColecao.nome || novaColecao.itens.length === 0) return;
    await addDoc(collection(db, "colecoes"), novaColecao);
    setNovaColecao({ nome: "", itens: [] });
    carregarColecoes();
  };

  // Atualizar coleção existente
  const atualizarColecao = async () => {
    if (!editarColecao || !editarColecao.nome || editarColecao.itens.length === 0) return;
    await updateDoc(doc(db, "colecoes", editarColecao.idDoc), {
      nome: editarColecao.nome,
      itens: editarColecao.itens
    });
    setEditarColecao(null);
    carregarColecoes();
  };

  // Deletar coleção
  const deletarColecao = async (c) => {
    if (!confirm(`Deseja deletar a coleção ${c.nome}?`)) return;
    await deleteDoc(doc(db, "colecoes", c.idDoc));
    carregarColecoes();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciador de Coleções de Figurinhas</h1>

      {/* --- Criar nova coleção --- */}
      <div className="bg-gray-800 p-4 rounded shadow mb-6 flex flex-col gap-2">
        <input
          type="text"
          className="p-2 rounded bg-gray-700"
          placeholder="Nome da coleção"
          value={novaColecao.nome}
          onChange={(e) => setNovaColecao({ ...novaColecao, nome: e.target.value })}
        />

        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            className="p-2 rounded bg-gray-700 flex-1"
            placeholder="Link da figurinha/gif"
            value={itemAtual.link}
            onChange={(e) => setItemAtual({ ...itemAtual, link: e.target.value })}
          />
          <input
            type="text"
            className="p-2 rounded bg-gray-700 flex-1"
            placeholder="Categoria (gif, figurinha)"
            value={itemAtual.categoria}
            onChange={(e) => setItemAtual({ ...itemAtual, categoria: e.target.value })}
          />
          <button
            onClick={adicionarItem}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Adicionar Item
          </button>
        </div>

        {/* Listar itens adicionados */}
        <div className="mt-2 flex flex-wrap gap-2">
          {novaColecao.itens.map((i, idx) => (
            <div key={idx} className="bg-gray-700 p-2 rounded flex flex-col items-center w-32">
              <img src={i.link} alt={i.categoria} className="w-full h-20 object-contain rounded mb-1" />
              <div className="text-sm">{i.categoria}</div>
            </div>
          ))}
        </div>

        <button
          onClick={salvarColecao}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mt-2"
        >
          Salvar Coleção
        </button>
      </div>

      {/* --- Listar coleções existentes --- */}
      <h2 className="text-2xl font-bold mb-2">Coleções Existentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colecoes.map(c => (
          <div key={c.idDoc} className="bg-gray-800 p-4 rounded shadow flex flex-col gap-2">
            <div className="font-bold">{c.nome}</div>
            <div className="flex flex-wrap gap-2">
              {c.itens.map((i, idx) => (
                <img key={idx} src={i.link} alt={i.categoria} className="w-16 h-16 object-contain rounded" />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setEditarColecao(c)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => deletarColecao(c)}
                className="flex-1 bg-red-600 hover:bg-red-700 py-1 rounded"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Modal editar coleção --- */}
      <AnimatePresence>
        {editarColecao && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 p-6 rounded shadow w-80"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-xl font-bold mb-2">Editar Coleção</h2>
              <input
                className="w-full p-2 mb-2 bg-gray-800 rounded"
                value={editarColecao.nome}
                onChange={(e) => setEditarColecao({ ...editarColecao, nome: e.target.value })}
              />

              {/* Editar itens */}
              {editarColecao.itens.map((i, idx) => (
                <div key={idx} className="flex gap-2 mb-1">
                  <input
                    className="flex-1 p-2 rounded bg-gray-700"
                    value={i.link}
                    onChange={(e) => {
                      const itens = [...editarColecao.itens];
                      itens[idx].link = e.target.value;
                      setEditarColecao({ ...editarColecao, itens });
                    }}
                  />
                  <input
                    className="flex-1 p-2 rounded bg-gray-700"
                    value={i.categoria}
                    onChange={(e) => {
                      const itens = [...editarColecao.itens];
                      itens[idx].categoria = e.target.value;
                      setEditarColecao({ ...editarColecao, itens });
                    }}
                  />
                  <button
                    className="bg-red-600 hover:bg-red-700 px-2 rounded"
                    onClick={() => {
                      const itens = editarColecao.itens.filter((_, iidx) => iidx !== idx);
                      setEditarColecao({ ...editarColecao, itens });
                    }}
                  >
                    X
                  </button>
                </div>
              ))}

              {/* Adicionar novo item */}
              <div className="flex gap-2 mt-2">
                <input
                  className="flex-1 p-2 rounded bg-gray-700"
                  placeholder="Link do novo item"
                  value={itemAtual.link}
                  onChange={e => setItemAtual({ ...itemAtual, link: e.target.value })}
                />
                <input
                  className="flex-1 p-2 rounded bg-gray-700"
                  placeholder="Categoria"
                  value={itemAtual.categoria}
                  onChange={e => setItemAtual({ ...itemAtual, categoria: e.target.value })}
                />
                <button
                  className="bg-green-600 hover:bg-green-700 px-2 rounded"
                  onClick={() => {
                    if (!itemAtual.link || !itemAtual.categoria) return;
                    setEditarColecao({ ...editarColecao, itens: [...editarColecao.itens, itemAtual] });
                    setItemAtual({ link: "", categoria: "" });
                  }}
                >
                  +
                </button>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-1 rounded"
                  onClick={() => setEditarColecao(null)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
                  onClick={atualizarColecao}
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
