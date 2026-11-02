/* Retroboy curated homebrew catalog. Links point to creator-authorized game pages. */
(function(){
  const games=[
    {title:"Pixel Panic",system:"RETROBOY ORIGINAL · PLAY IN BROWSER",tag:"INSTANT PLAY",art:"🛸",play:true,desc:"An original arcade survival mini-game made for Retroboy."},
    {title:"Tobu Tobu Girl",system:"GAME BOY · FREE HOMEBREW",tag:"FREE HOMEBREW",art:"🎀",url:"https://tangramgames.dk/tobutobugirl/",desc:"Creator-offered Game Boy platformer. Get the ROM from its official page."},
    {title:"µCity",system:"GAME BOY · HOMEBREW",tag:"HOMEBREW",art:"🏙️",url:"https://github.com/AntonioND/ucity",desc:"A homebrew city-building project; check its creator page for available builds."}
  ];
  const style=document.createElement("style");
  style.textContent=".popular-catalog{padding:8px 0 42px}.popular-catalog .catalog-sub{color:var(--muted);font-size:13px;line-height:1.6;margin:-10px 0 22px}.popular-catalog .catalog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.popular-catalog .catalog-card{background:#272130;border:1px solid var(--line);border-radius:20px 8px 20px 8px;overflow:hidden}.popular-catalog .catalog-art{height:150px;display:grid;place-items:center;font-size:64px;background:linear-gradient(135deg,#7856ff,#272130);position:relative}.popular-catalog .catalog-art img{height:100%;width:100%;object-fit:contain;padding:12px}.popular-catalog .catalog-tag{position:absolute;top:12px;left:12px;background:var(--lime);color:var(--ink);font:7px 'Press Start 2P';padding:8px;z-index:1}.popular-catalog .catalog-info{padding:14px}.popular-catalog .catalog-info h3{margin:0;font-size:16px}.popular-catalog .catalog-info p{color:var(--muted);font-size:12px;line-height:1.5;min-height:36px}.popular-catalog .catalog-action{display:inline-block;border:0;border-radius:8px 18px;background:var(--pink);color:var(--ink);padding:10px 14px;font-weight:700;text-decoration:none;font-size:12px}@media(max-width:560px){.popular-catalog .catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.popular-catalog .catalog-art{height:120px}.popular-catalog .catalog-info{padding:10px}.popular-catalog .catalog-info h3{font-size:13px}}";
  document.head.appendChild(style);
  const section=document.createElement("section");section.className="popular-catalog";
  section.innerHTML='<div class="section-head"><div><div class="eyebrow">CURATED FREE & AUTHORIZED GAMES</div><h2>POPULAR GAMES<span style="color:var(--lime)">.</span></h2></div></div><p class="catalog-sub">Featured original and homebrew games. External games link to their creators’ official pages; download a permitted ROM there, then load it in Retroboy.</p><div class="catalog-grid"></div>';
  const library=document.getElementById("library");if(!library)return;
  library.insertBefore(section,library.querySelector(".filters"));
  const grid=section.querySelector(".catalog-grid");
  games.forEach((g,i)=>{
    const card=document.createElement("article");card.className="catalog-card";
    card.innerHTML='<div class="catalog-art"><span class="catalog-tag">'+g.tag+'</span><span class="catalog-emoji">'+g.art+'</span></div><div class="catalog-info"><h3>'+g.title+'</h3><p>'+g.system+'<br>'+g.desc+'</p><button class="catalog-action" type="button">'+(g.play?"PLAY NOW ↗":"CREATOR PAGE ↗")+'</button></div>';
    const button=card.querySelector("button");
    button.addEventListener("click",()=>{if(g.play&&typeof launchPixelPanic==="function"){launchPixelPanic();return}window.open(g.url,"_blank","noopener,noreferrer")});
    grid.appendChild(card);
    if(!g.play){
      const art=card.querySelector(".catalog-emoji");
      const term=encodeURIComponent(g.title+" video game");
      fetch("https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch="+term+"&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=320&format=json&origin=*").then(r=>r.ok?r.json():null).then(data=>{const pages=Object.values(data&&data.query&&data.query.pages||{});const p=pages.find(x=>x.imageinfo&&x.imageinfo[0]&&x.imageinfo[0].thumburl);if(p){const img=document.createElement("img");img.src=p.imageinfo[0].thumburl;img.alt=g.title+" artwork";img.loading="lazy";art.replaceWith(img)}}).catch(()=>{});
    }
  });
})();