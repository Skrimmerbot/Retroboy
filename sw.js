const CACHE_NAME="retroboy-offline-v1";
const APP_SHELL=["./","./index.html","./popular-games.js","./games.json","./manifest.json","./icon.svg","./archive-worker.js"];
const CACHEABLE_HOSTS=new Set([
  "cdn.emulatorjs.org",
  "cdnjs.cloudflare.com",
  "cdn.jsdelivr.net",
  "fonts.googleapis.com",
  "fonts.gstatic.com"
]);
self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async path=>{
      try{const key=new URL(path,self.registration.scope).href;const response=await fetch(key,{cache:"reload"});if(response.ok)await cache.put(key,response)}catch(_){}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith("retroboy-")&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin&&!CACHEABLE_HOSTS.has(url.hostname))return;
  if(url.origin===self.location.origin&&url.pathname.includes("/oauth"))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(request);
    if(request.mode==="navigate"){
      try{
        const fresh=await fetch(request);
        if(fresh.ok)await cache.put(request,fresh.clone());
        return fresh;
      }catch(error){
        return cached||await cache.match(new URL("./index.html",self.registration.scope).href)||Response.error();
      }
    }
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response.ok||response.type==="opaque")await cache.put(request,response.clone());
      return response;
    }catch(error){
      return cached||Response.error();
    }
  })());
});
