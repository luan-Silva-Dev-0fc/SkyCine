const { exec } = require("child_process");

console.log("Limpando caches do Next.js e Service Worker...");

exec("npm cache clean --force", (err, stdout, stderr) => {
  if (err) console.error(err);
  console.log(stdout);
  console.log(stderr);
});

exec("rm -rf .next", (err, stdout, stderr) => {
  if (err) console.error(err);
  console.log(".next limpo!");
});

console.log("Cache limpo. Rode 'npm run dev' ou 'npm run start' novamente.");
