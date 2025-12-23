export default function IPTV() {
  const players = [
    { canal: "cartoon", nome: "Cartoon" },
    { canal: "paramountplus4", nome: "Paramount+" },
    { canal: "band", nome: "Band" },
    { canal: "globonews", nome: "GloboNews" },
    { canal: "hbo2", nome: "HBO2" },
    { canal: "telecineaction", nome: "Telecine Action" },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>SkyCine IPTV</h1>
      </header>

      <div style={styles.grid}>
        {players.map((p) => (
          <div key={p.canal} style={styles.card}>
            <h2 style={styles.canalNome}>{p.nome}</h2>
            <iframe
              name="Player"
              src={`//%72%65%64%65%63%61%6E%61%69%73%74%76%2E%66%6D/player3/ch.php?canal=${p.canal}`}
              frameBorder="0"
              height="400"
              width="640"
              scrolling="no"
              allow="encrypted-media"
              allowFullScreen
              style={styles.iframe}
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#050505",
    color: "#fff",
    fontFamily: "sans-serif",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #8b2ce2, #d27eff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(680px, 1fr))",
    gap: "24px",
    justifyContent: "center",
  },
  card: {
    background: "#0c0c0c",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 10px 30px rgba(140, 44, 226, 0.4)",
    textAlign: "center",
  },
  canalNome: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#d27eff",
  },
  iframe: {
    borderRadius: "12px",
    maxWidth: "100%",
  },
};
