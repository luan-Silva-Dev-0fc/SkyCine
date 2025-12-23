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
        <h1 style={styles.title}>SkyCine</h1>
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
            <button style={styles.menuButton} onClick={() => router.push("/mais-opcoes")}>Mais opções</button>
            <button style={styles.menuButton} onClick={() => router.push("/configuracoes")}>Configurações</button>
            
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
    background: "linear-gradient(180deg, #050505, #0a0a0a)",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
  },

header: {
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  padding: "18px 24px",
  backdropFilter: "blur(10px)",
  background: "rgba(5,5,5,0.7)",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  position: "relative",
},


  menuIcon: {
    width: "28px",
    cursor: "pointer",
    filter: "invert(1)",
    transition: "transform .2s ease",
  },

  title: {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "20px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  pointerEvents: "none", // evita atrapalhar o clique no menu
},


  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 30,
  },

  menu: {
    width: "270px",
    height: "100%",
    background: "linear-gradient(180deg, #0c0c0c, #111)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "10px 0 40px rgba(0,0,0,.6)",
    animation: "slideIn .25s ease",
  },

  menuButton: {
    padding: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px",
    transition: "all .2s ease",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "26px",
    padding: "30px",
  },

  card: {
    position: "relative",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "18px",
    padding: "10px",
    overflow: "hidden",
    transition: "transform .25s ease, box-shadow .25s ease",
    boxShadow: "0 10px 30px rgba(0,0,0,.4)",
  },

  capa: {
    width: "100%",
    borderRadius: "14px",
    aspectRatio: "2/3",
    objectFit: "cover",
  },

  filmeTitulo: {
    margin: "14px 0 10px",
    fontSize: "14px",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: "1.3",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  assistir: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #e50914, #b20710)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    letterSpacing: "0.3px",
    transition: "transform .2s ease, filter .2s ease",
  },

  destaquesSection: {
    padding: "50px 30px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },

  destaquesTitulo: {
    marginBottom: "24px",
    fontSize: "22px",
    fontWeight: "700",
  },

  destaquesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "26px",
  },
};
