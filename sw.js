const CACHE="lift-log-soi-v5";
const APP_SHELL=new URL("./",self.registration.scope).href;
const PRECACHE=[APP_SHELL,new URL("manifest.webmanifest",self.registration.scope).href,new URL("exercise-form-sprite.png",self.registration.scope).href];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response.ok&&!response.redirected&&response.type==="basic"){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));
      }
      return response;
    }).catch(()=>event.request.mode==="navigate"?caches.match(APP_SHELL):undefined))
  );
});
