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
    <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-400 bg-clip-text text-transparent">
          SkyCine IPTV
        </h1>
      </header>

      <div className="grid gap-6 md:gap-8 justify-center grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {players.map((p) => (
          <div
            key={p.canal}
            className="bg-gray-900 rounded-xl p-6 shadow-[0_10px_30px_rgba(140,44,226,0.4)] text-center"
          >
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-pink-400">
              {p.nome}
            </h2>
            <iframe
              name="Player"
              src={`//%72%65%64%65%63%61%6E%61%69%73%74%76%2E%66%6D/player3/ch.php?canal=${p.canal}`}
              frameBorder="0"
              height="400"
              width="100%"
              scrolling="no"
              allow="encrypted-media"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
}
 