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

// External provider discovery + permission-aware embedded game pages.
// This intentionally embeds provider game pages only; it never scrapes or proxies ROM files.
(function(){
  const providers = [
    { id:"romsgames", name:"ROMsGames", url:"https://www.romsgames.net/", host:"romsgames.net", status:"EMBED SUPPORT UNVERIFIED", note:"Browse the provider's catalogue. Individual pages may prohibit framing." },
    { id:"classicgamezone", name:"Classic Game Zone", url:"https://classicgamezone.com/", host:"classicgamezone.com", status:"EMBED SUPPORT UNVERIFIED", note:"Browse the provider's catalogue. Individual pages may prohibit framing." }
  ];

  const style=document.createElement("style");
  style.textContent = [
    ".external-arcade{padding:28px 0 38px;border-top:1px solid var(--line);margin-top:30px}",
    ".external-arcade .external-copy{color:var(--muted);font-size:13px;line-height:1.65;max-width:760px;margin:-8px 0 22px}",
    ".external-arcade .provider-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:24px}",
    ".external-arcade .provider-card{background:#272130;border:1px solid var(--line);border-radius:20px 8px 20px 8px;padding:18px;display:flex;flex-direction:column;gap:10px;min-width:0}",
    ".external-arcade .provider-card h3{margin:0;font-size:17px}",
    ".external-arcade .provider-card p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}",
    ".external-arcade .provider-status{font:7px 'Press Start 2P';color:var(--orange);line-height:1.8}",
    ".external-arcade .provider-link{align-self:flex-start;border:0;border-radius:8px 18px;background:var(--lime);color:var(--ink);padding:10px 14px;font-weight:700;text-decoration:none;font-size:12px}",
    ".external-arcade .embed-panel{background:#211b2b;border:1px solid var(--line);border-radius:20px 8px;padding:18px}",
    ".external-arcade .embed-panel h3{margin:0 0 8px;font-size:16px}",
    ".external-arcade .embed-panel p{color:var(--muted);font-size:12px;line-height:1.6;margin:0 0 14px}",
    ".external-arcade .embed-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}",
    ".external-arcade .embed-form input[type=url]{min-width:0;width:100%;background:#17131f;border:1px solid var(--line);border-radius:9px;padding:12px 14px;color:var(--paper);outline:none}",
    ".external-arcade .embed-form input[type=url]:focus{border-color:var(--lime)}",
    ".external-arcade .embed-consent{display:flex;align-items:flex-start;gap:9px;color:var(--muted);font-size:12px;line-height:1.5;margin:14px 0}",
    ".external-arcade .embed-consent input{accent-color:var(--lime);margin-top:2px}",
    ".external-arcade .embed-error{color:var(--pink);font-size:12px;min-height:18px;margin-top:8px}",
    ".external-arcade .embed-hint{font-size:11px;color:var(--muted);margin-top:10px}",
    "@media(max-width:560px){.external-arcade .provider-grid{grid-template-columns:1fr}.external-arcade .embed-form{grid-template-columns:1fr}.external-arcade .embed-form .provider-link{width:100%;justify-content:center;text-align:center}}",
    ".provider-frame-wrap{width:100%;height:min(70vh,620px);min-height:360px;background:#0e0c13;border-radius:10px;overflow:hidden}",
    ".provider-frame-wrap iframe{display:block;width:100%;height:100%;border:0;background:#0e0c13}"
  ].join("");
  document.head.appendChild(style);

  const library=document.getElementById("library");
  if(!library || document.querySelector(".external-arcade")) return;

  const section=document.createElement("section");
  section.className="external-arcade";
  section.innerHTML =
    '<div class="section-head"><div><div class="eyebrow">THIRD-PARTY ARCADES</div><h2>PLAY FROM THE WEB<span style="color:var(--lime)">.</span></h2></div></div>'+
    '<p class="external-copy">Find games on supported third-party sites and try their game pages inside RETROBOY. Embedding depends on each page\'s permission and security settings. We do not copy, host, proxy, or extract ROM files from these providers.</p>'+
    '<div class="provider-grid"></div>'+
    '<div class="embed-panel"><h3>OPEN A GAME PAGE IN RETROBOY</h3>'+
    '<p>Paste a game-page URL from one of the listed providers. This is an iframe preview of the provider page, not a ROM download. If the provider blocks embedding, use its original page instead.</p>'+
    '<form class="embed-form"><input type="url" id="retroProviderUrl" placeholder="https://www.romsgames.net/..." autocomplete="url" required><button class="provider-link" type="submit">TRY EMBED ↗</button></form>'+
    '<label class="embed-consent"><input type="checkbox" id="retroEmbedConsent"><span>I have checked that this specific page permits embedding and that I am allowed to access its content.</span></label>'+
    '<div class="embed-error" id="retroEmbedError" role="status" aria-live="polite"></div>'+
    '<div class="embed-hint">Allowed source domains: romsgames.net and classicgamezone.com, including their subdomains.</div></div>';

  const grid=section.querySelector(".provider-grid");
  providers.forEach(provider=>{
    const card=document.createElement("article");
    card.className="provider-card";
    const title=document.createElement("h3");title.textContent=provider.name;
    const status=document.createElement("div");status.className="provider-status";status.textContent=provider.status;
    const note=document.createElement("p");note.textContent=provider.note;
    const link=document.createElement("a");link.className="provider-link";link.href=provider.url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="BROWSE SOURCE ↗";
    card.append(title,status,note,link);grid.appendChild(card);
  });

  const filters=library.querySelector(".filters");
  if(filters) library.insertBefore(section,filters); else library.appendChild(section);

  const form=section.querySelector("form");
  const urlInput=section.querySelector("#retroProviderUrl");
  const consent=section.querySelector("#retroEmbedConsent");
  const error=section.querySelector("#retroEmbedError");
  const allowedHosts=providers.map(p=>p.host);

  form.addEventListener("submit",event=>{
    event.preventDefault();
    error.textContent="";
    let parsed;
    try{parsed=new URL(urlInput.value.trim())}catch(e){error.textContent="Enter a valid game-page URL.";return}
    const host=parsed.hostname.toLowerCase().replace(/^www\./,"");
    const allowed=allowedHosts.some(domain=>host===domain||host.endsWith("."+domain));
    if(parsed.protocol!=="https:"||!allowed){error.textContent="For safety, use an HTTPS game page from one of the listed providers.";return}
    if(!consent.checked){error.textContent="Please confirm that this page permits embedding before trying it.";return}

    const player=document.getElementById("player");
    const modalTitle=document.getElementById("modalTitle");
    if(!player||!document.getElementById("modal")){error.textContent="The RETROBOY player is unavailable.";return}
    if(typeof window.openPlayer==="function") window.openPlayer();
    else document.getElementById("modal").classList.add("open");
    modalTitle.textContent="WEB ARCADE · "+host.toUpperCase();

    const wrap=document.createElement("div");wrap.className="provider-frame-wrap";
    const iframe=document.createElement("iframe");
    iframe.title="Third-party game page from "+host;
    iframe.src=parsed.href;
    iframe.allow="fullscreen; gamepad; autoplay";
    iframe.allowFullscreen=true;
    iframe.referrerPolicy="strict-origin-when-cross-origin";
    iframe.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-presentation");
    wrap.appendChild(iframe);

    const message=document.createElement("div");message.className="player-message";
    message.style.maxWidth="none";message.style.width="100%";
    const heading=document.createElement("h3");heading.textContent="IF THE GAME DOES NOT APPEAR…";
    const copy=document.createElement("p");copy.textContent="The provider may block iframe playback with its security policy. RETROBOY cannot bypass that restriction.";
    const open=document.createElement("a");open.className="file-btn";open.href=parsed.href;open.target="_blank";open.rel="noopener noreferrer";open.textContent="OPEN ORIGINAL GAME PAGE ↗";
    message.append(heading,copy,open);
    player.replaceChildren(wrap,message);
    player.scrollIntoView({block:"nearest"});
  });
})();
