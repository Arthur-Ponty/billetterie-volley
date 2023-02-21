var cacheName = 'qr_scan_volley-v1';
var appShellFiles = [
  './index.html',
  './manifest.json',
  './js/app.js',
  './js/qr_packed.js',
  './css/qr-scan.css',
  './imgs/qr_icon.svg',
  './icons/icon-256.png',
  './icons/icon-512.png',
];

// We add the cache
self.addEventListener('install', function(e) {
	console.log('[Service Worker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[Service Worker] Caching all: app shell and content');
			return cache.addAll(contentToCache);
		})
	);
});

// Whenever there is a new file to fecth we add it to the cache before served it
self.addEventListener('fetch', function(e) {
	e.respondWith(
		caches.match(e.request).then(function(r) {
			console.log('[Service Worker] Fetching resource: '+e.request.url);
			return r || fetch(e.request).then(function(response) {
				return caches.open(cacheName).then(function(cache) {
					console.log('[Service Worker] Caching new resource: '+e.request.url);
					cache.put(e.request, response.clone());
					return response;
				});
			});
		})
	);
});

// Delete the old cache if a new version is out
self.addEventListener("activate", (e) => {
	e.waitUntil(
	  	caches.keys().then((keyList) => {
			return Promise.all(
		  	keyList.map((key) => {
				if (key === cacheName) {
				  return;
				}
				return caches.delete(key);
		  	})
			);
	  	})
	);
});