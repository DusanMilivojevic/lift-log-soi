const CACHE="lift-log-soi-v10";
const APP_SHELL=new URL("./",self.registration.scope).href;
const PRECACHE=[APP_SHELL,new URL("manifest.webmanifest",self.registration.scope).href,new URL("exercise-form-sprite.png",self.registration.scope).href,new URL("coaching.js",self.registration.scope).href];

self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});

async function coachingPage(response){
  if(!response)return response;
  const html=await response.text();
  const enhanced=html.includes('coaching.js')?html:html.replace('</body>','<script src="./coaching.js?v=1"></script></body>');
  return new Response(enhanced,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
}

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:'no-store'});
        if(response.ok&&!response.redirected){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(APP_SHELL,copy)));return coachingPage(response)}
        return response;
      }catch(e){return coachingPage(await caches.match(APP_SHELL))}
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok&&!response.redirected&&response.type==="basic"){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}return response})));
});
