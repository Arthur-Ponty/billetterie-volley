var cacheName = 'qr_scan_volley-v1';
var contentToCache = [
  '/qr_scan_volley/index.html',
  '/qr_scan_volley/manifest.json',
  '/qr_scan_volley/js/app.js',
  '/qr_scan_volley/js/qr_packed.js',
  '/qr_scan_volley/css/qr-scan.css',
  '/qr_scan_volley/imgs/qr_icon.svg',
  '/qr_scan_volley/imgs/logo_club.png',
  '/qr_scan_volley/icons/icon-256.png',
  '/qr_scan_volley/icons/icon-512.png',
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