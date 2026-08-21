const fs = require('fs');
const svgRaw = fs.readFileSync('public/icons/icon.svg', 'utf8');

[192, 512].forEach(size => {
  // Wrappa l'SVG in un contenitore della dimensione giusta
  const cleaned = svgRaw
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .trim();
  
  // Sostituisce width/height nell'SVG root per il sizing corretto
  const resized = cleaned
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`);
  
  fs.writeFileSync(`public/icons/icon-${size}.png.svg`, resized);
  console.log(`Creato icon-${size} (${resized.length} bytes)`);
});

// Aggiorna manifest per usare SVG (supportato da tutti i browser moderni)
const manifest = {
  name: "MailCleaner - Pulizia Email Intelligente",
  short_name: "MailCleaner",
  description: "App per la gestione e pulizia automatica di caselle email multiple (Gmail, Libero, Outlook, IMAP)",
  start_url: "/mailcleaner-app/",
  scope: "/mailcleaner-app/",
  display: "standalone",
  background_color: "#090d16",
  theme_color: "#6366f1",
  orientation: "portrait",
  icons: [
    { src: "/mailcleaner-app/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    { src: "/mailcleaner-app/icons/icon-192.png.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" },
    { src: "/mailcleaner-app/icons/icon-512.png.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
  ]
};

fs.writeFileSync('public/manifest.webmanifest', JSON.stringify(manifest, null, 2));
console.log('Manifest aggiornato con start_url corretto per GitHub Pages');
