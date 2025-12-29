"use client";

import { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function Admin() {
  const [categorias, setCategorias] = useState([]);
  const [nomeCategoria, setNomeCategoria] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [filmes, setFilmes] = useState([]);
  const [series, setSeries] = useState([]);
  const [formFilme, setFormFilme] = useState({ titulo: "", capa: "", video: "", estrelas: 5, destaque: false });
  const [formSerie, setFormSerie] = useState({ titulo: "", capa: "", temporadas: [] });
  const [novoCapitulo, setNovoCapitulo] = useState({ video: "", texto: "" });

  const firebaseConfig = {
    apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
    authDomain: "skycine-c59b0.firebaseapp.com",
    projectId: "skycine-c59b0",
    storageBucket: "skycine-c59b0.firebasestorage.app",
    messagingSenderId: "1084857538934",
    appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
  };

  const app = useMemo(() => (getApps().length ? getApp() : initializeApp(firebaseConfig)), []);
  const db = useMemo(() => getFirestore(app), [app]);

  const loadCategorias = async () => {
    const snap = await getDocs(collection(db, "categorias"));
    setCategorias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadFilmes = async categoriaId => {
    if (!categoriaId) return;
    const snapFilmes = await getDocs(collection(db, "categorias", categoriaId, "filmes"));
    setFilmes(snapFilmes.docs.map(d => ({ id: d.id, ...d.data() })));
    const snapSeries = await getDocs(collection(db, "categorias", categoriaId, "series"));
    setSeries(snapSeries.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadCategorias(); }, []);
  useEffect(() => {
    if (selectedCategoria) loadFilmes(selectedCategoria.id);
    else { setFilmes([]); setSeries([]); }
  }, [selectedCategoria]);

  const criarCategoria = async () => {
    if (!nomeCategoria) return;
    await addDoc(collection(db, "categorias"), { nome: nomeCategoria });
    setNomeCategoria(""); loadCategorias();
  };

  const deletarCategoria = async id => {
    await deleteDoc(doc(db, "categorias", id));
    if (selectedCategoria?.id === id) setSelectedCategoria(null);
    loadCategorias();
  };

  const criarFilme = async () => {
    if (!selectedCategoria) return;
    await addDoc(collection(db, "categorias", selectedCategoria.id, "filmes"), formFilme);
    setFormFilme({ titulo: "", capa: "", video: "", estrelas: 5, destaque: false });
    loadFilmes(selectedCategoria.id);
  };

  const atualizarFilme = async (filmeId, data) => {
    await updateDoc(doc(db, "categorias", selectedCategoria.id, "filmes", filmeId), data);
    loadFilmes(selectedCategoria.id);
  };

  const deletarFilme = async filmeId => {
    await deleteDoc(doc(db, "categorias", selectedCategoria.id, "filmes", filmeId));
    loadFilmes(selectedCategoria.id);
  };

  const criarSerie = async () => {
    if (!selectedCategoria) return;
    await addDoc(collection(db, "categorias", selectedCategoria.id, "series"), formSerie);
    setFormSerie({ titulo: "", capa: "", temporadas: [] });
    loadFilmes(selectedCategoria.id);
  };

  const deletarSerie = async serieId => {
    await deleteDoc(doc(db, "categorias", selectedCategoria.id, "series", serieId));
    loadFilmes(selectedCategoria.id);
  };

  const adicionarTemporada = () => {
    const numero = formSerie.temporadas.length + 1;
    setFormSerie({ ...formSerie, temporadas: [...formSerie.temporadas, { nome: `Temporada ${numero}`, capitulos: [] }] });
  };

  const adicionarCapitulo = (index) => {
    const temporada = formSerie.temporadas[index];
    const capitulo = { nome: `Capítulo ${temporada.capitulos.length + 1}`, video: novoCapitulo.video, texto: novoCapitulo.texto };
    const novas = [...formSerie.temporadas];
    novas[index].capitulos.push(capitulo);
    setFormSerie({ ...formSerie, temporadas: novas });
    setNovoCapitulo({ video: "", texto: "" });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Admin • SkyCine</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-2">
        <input value={nomeCategoria} onChange={e => setNomeCategoria(e.target.value)} placeholder="Nova Categoria" className="flex-1 px-4 py-2 rounded bg-gray-800"/>
        <button onClick={criarCategoria} className="bg-red-600 px-6 py-2 rounded font-bold">Criar</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {categorias.map(c => (
          <div key={c.id} className={`p-4 rounded-xl flex justify-between items-center ${selectedCategoria?.id === c.id ? "bg-red-700" : "bg-gray-900"}`}>
            <span>{c.nome}</span>
            <div className="flex gap-2">
              <button onClick={() => setSelectedCategoria(c)} className="px-3 py-1 bg-white/10 rounded">Abrir</button>
              <button onClick={() => deletarCategoria(c.id)} className="px-3 py-1 bg-red-600 rounded">Deletar</button>
            </div>
          </div>
        ))}
      </div>

      {selectedCategoria && (
        <div>
          <h2 className="text-2xl font-bold mb-4">{selectedCategoria.nome} • Filmes</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input placeholder="Título" value={formFilme.titulo} onChange={e => setFormFilme({ ...formFilme, titulo: e.target.value })} className="px-4 py-2 rounded bg-gray-800"/>
            <input placeholder="Capa (URL)" value={formFilme.capa} onChange={e => setFormFilme({ ...formFilme, capa: e.target.value })} className="px-4 py-2 rounded bg-gray-800"/>
            <input placeholder="Vídeo (URL)" value={formFilme.video} onChange={e => setFormFilme({ ...formFilme, video: e.target.value })} className="px-4 py-2 rounded bg-gray-800"/>
            <input type="number" min="1" max="5" value={formFilme.estrelas} onChange={e => setFormFilme({ ...formFilme, estrelas: +e.target.value })} className="px-4 py-2 rounded bg-gray-800"/>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formFilme.destaque} onChange={e => setFormFilme({ ...formFilme, destaque: e.target.checked })}/> Destaque</label>
            <button onClick={criarFilme} className="bg-red-600 py-2 rounded font-bold">Adicionar Filme</button>
          </div>

          <div className="grid gap-4 mb-8">
            {filmes.map(f => (
              <div key={f.id} className="flex justify-between items-center p-4 bg-gray-900 rounded-xl">
                <div>
                  <div className="font-medium">{f.titulo}</div>
                  <div className="text-xs opacity-60">⭐ {f.estrelas} {f.destaque && "• Destaque"}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => atualizarFilme(f.id, { destaque: !f.destaque })} className="px-3 py-1 bg-white/10 rounded">Destaque</button>
                  <button onClick={() => deletarFilme(f.id)} className="px-3 py-1 bg-red-600 rounded">Deletar</button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">{selectedCategoria.nome} • Séries</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Título da Série" value={formSerie.titulo} onChange={e => setFormSerie({ ...formSerie, titulo: e.target.value })} className="px-4 py-2 rounded bg-gray-800"/>
            <input placeholder="Capa (URL)" value={formSerie.capa} onChange={e => setFormSerie({ ...formSerie, capa: e.target.value })} className="px-4 py-2 rounded bg-gray-800"/>
            <button onClick={adicionarTemporada} className="bg-red-600 py-2 rounded font-bold">Adicionar Temporada</button>
          </div>

          {formSerie.temporadas.map((t, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded-xl mb-4">
              <h3 className="font-bold mb-2">{t.nome}</h3>
              <div className="grid gap-2">
                {t.capitulos.map((c, j) => (
                  <div key={j} className="p-2 bg-gray-800 rounded flex justify-between items-center">
                    <span>{c.nome}</span>
                    <span>{c.video}</span>
                    {c.texto && <span>{c.texto}</span>}
                  </div>
                ))}
                <input placeholder="Vídeo do Capítulo" value={novoCapitulo.video} onChange={e => setNovoCapitulo({ ...novoCapitulo, video: e.target.value })} className="px-4 py-2 rounded bg-gray-800"/>
                <input placeholder="Texto Opcional" value={novoCapitulo.texto} onChange={e => setNovoCapitulo({ ...novoCapitulo, texto: e.target.value })} className="px-4 py-2 rounded bg-gray-800"/>
                <button onClick={() => adicionarCapitulo(i)} className="bg-red-500 py-2 rounded font-bold">Adicionar Capítulo</button>
              </div>
            </div>
          ))}

          <button onClick={criarSerie} className="bg-red-600 py-2 rounded font-bold mb-4">Criar Série</button>

          <div className="grid gap-4">
            {series.map(s => (
              <div key={s.id} className="p-4 bg-gray-900 rounded-xl flex flex-col md:flex-row items-center gap-4">
                {s.capa && <img src={s.capa} className="w-full md:w-48 aspect-[2/3] object-cover rounded"/>}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{s.titulo}</span>
                    <button onClick={() => deletarSerie(s.id)} className="px-3 py-1 bg-red-600 rounded">Deletar</button>
                  </div>
                  {s.temporadas?.map((t, i) => (
                    <div key={i} className="ml-2 mb-2">
                      <div className="font-semibold">{t.nome}</div>
                      {t.capitulos?.map((c, j) => (
                        <div key={j} className="ml-4 text-sm">{c.nome} • {c.video} {c.texto && `• ${c.texto}`}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
