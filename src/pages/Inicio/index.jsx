import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
    authDomain: "skycine-c59b0.firebaseapp.com",
    projectId: "skycine-c59b0",
    storageBucket: "skycine-c59b0.firebasestorage.app",
    messagingSenderId: "1084857538934",
    appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);

  const [filmes, setFilmes] = useState([]);
  const [destaques, setDestaques] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      const filmesSnap = await getDocs(collection(db, "filmes"));
      setFilmes(filmesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const destaquesSnap = await getDocs(collection(db, "cdstack"));
      setDestaques(destaquesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }

    carregarDados();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/8024/8024270.png"
          style={styles.menuIcon}
          onClick={() => setMenuOpen(true)}
        />
        <h1 style={styles.title}>Bem-vindo ao SkyCine</h1>
      </header>

      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)}>
          <aside style={styles.menu} onClick={(e) => e.stopPropagation()}>
            <button style={styles.menuButton} onClick={() => router.push("/series")}>Séries</button>
            <button style={styles.menuButton} onClick={() => router.push("/comedia")}>Comédia</button>
            <button style={styles.menuButton} onClick={() => router.push("/terror")}>Terror</button>
            <button style={styles.menuButton} onClick={() => router.push("/acao")}>Ação</button>
            <button style={styles.menuButton} onClick={() => router.push("/animes")}>Animes</button>
            <button style={styles.menuButton} onClick={() => router.push("/iptv")}>IPTV</button>
            <button style={styles.menuButton} onClick={() => router.push("/configuracoes")}>Configurações</button>
            <button style={styles.menuButton} onClick={() => router.push("/mais-opcoes")}>Mais opções</button>
          </aside>
        </div>
      )}

      <main style={styles.grid}>
        {filmes.map((filme) => (
          <div key={filme.id} style={styles.card}>
            <img src={filme.capa} style={styles.capa} />
            <div style={styles.filmeTitulo}>{filme.titulo}</div>
            <button
              style={styles.assistir}
              onClick={() => router.push(`/idfilmes?id=${filme.id}`)}
            >
              Assistir
            </button>
          </div>
        ))}
      </main>

      <section style={styles.destaquesSection}>
        <h2 style={styles.destaquesTitulo}>Veja nossos destaques</h2>
        <div style={styles.destaquesGrid}>
          {destaques.map((item) => (
            <div key={item.id} style={styles.card}>
              <img src={item.capa} style={styles.capa} />
              <div style={styles.filmeTitulo}>{item.titulo}</div>
              <button
                style={styles.assistir}
                onClick={() => router.push(`/id.destaques?id=${item.id}`)}
              >
                Assistir
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#050505",
    color: "#e5e5e5",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px",
    borderBottom: "1px solid #111",
  },

  menuIcon: {
    width: "26px",
    cursor: "pointer",
    filter: "invert(1)",
  },

  title: {
    fontSize: "18px",
    fontWeight: "600",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 10,
  },

  menu: {
    width: "260px",
    height: "100%",
    background: "#0d0d0d",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  menuButton: {
    padding: "14px",
    background: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "10px",
    color: "#e0e0e0",
    cursor: "pointer",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "24px",
    padding: "24px",
  },

  card: {
    background: "#0c0c0c",
    borderRadius: "16px",
    padding: "10px",
  },

  capa: {
    width: "100%",
    borderRadius: "12px",
  },

  filmeTitulo: {
    margin: "12px 0",
    fontSize: "14px",
    textAlign: "center",
  },

  assistir: {
    width: "100%",
    padding: "10px",
    background: "#1f1f1f",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  destaquesSection: {
    padding: "40px 24px",
    borderTop: "1px solid #111",
  },

  destaquesTitulo: {
    marginBottom: "20px",
    fontSize: "18px",
    fontWeight: "600",
  },

  destaquesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "22px",
  },
};
