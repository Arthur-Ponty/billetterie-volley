var cacheName = 'billetterie_volley-v1';
var contentToCache = [
  '/billetterie-volley/index.html',
  '/billetterie-volley/manifest.json',
  '/billetterie-volley/sw.js',
  '/billetterie-volley/js/app.js',
  '/billetterie-volley/js/qr_packed.js',
  '/billetterie-volley/css/qr-scan.css',
  '/billetterie-volley/imgs/logo_club.png',
  '/billetterie-volley/icons/icon-32.png',
  '/billetterie-volley/icons/icon-64.png',
  '/billetterie-volley/icons/icon-128.png',
  '/billetterie-volley/icons/icon-256.png',
  '/billetterie-volley/icons/icon-512.png',
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
					if ( !e.request.url.startsWith('chrome-extension') && !e.request.url.includes('extension') && (e.request.url.indexOf('http') === 0) ) {
						console.log('[Service Worker] Caching new resource: '+e.request.url);
						cache.put(e.request, response.clone());	
					}
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