/* Service worker DOREX : met l'application en cache pour un usage hors ligne.
   Changer VERSION après toute modification de dorex.html pour forcer la mise à jour. */
const VERSION = "dorex-v3";
const FICHIERS = ["dorex.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Réseau d'abord (pour récupérer les corrections), cache en secours hors ligne. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copie = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copie));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
