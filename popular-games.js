/* RETROBOY — local collection loader.
   Keeps the existing RETROBOY styling and hands selected ROMs to the
   existing EmulatorJS player in index.html. Add authorised ROMs to /roms
   and list them in games.json. */
(function () {
  const library = document.getElementById("library");
  if (!library || document.querySelector(".popular-catalog")) return;

  const style = document.createElement("style");
  style.textContent =
    ".popular-catalog{padding:8px 0 34px}" +
    ".popular-catalog .catalog-sub{color:var(--muted);font-size:13px;line-height:1.6;margin:-10px 0 22px}" +
    ".popular-catalog .catalog-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}" +
    ".popular-catalog .catalog-card{min-width:0;overflow:hidden}" +
    ".popular-catalog .catalog-art{aspect-ratio:.9;border-radius:22px 8px 22px 8px;border:1px solid rgba(255,255,255,.12);display:grid;place-items:center;overflow:hidden;background:linear-gradient(135deg,#7856ff,#272130);font-size:64px}" +
    ".popular-catalog .catalog-art img{width:100%;height:100%;object-fit:cover}" +
    ".popular-catalog .catalog-info{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:14px 4px}" +
    ".popular-catalog .catalog-info h3{margin:0;font-size:16px}" +
    ".popular-catalog .catalog-info p{color:var(--muted);font-size:12px;margin:5px 0 0}" +
    ".popular-catalog .catalog-action{flex-shrink:0;border:0;border-radius:50%;width:38px;height:38px;background:var(--pink);color:var(--ink);font-weight:900;cursor:pointer}" +
    ".popular-catalog .catalog-action:disabled{opacity:.55;cursor:wait}" +
    ".popular-catalog .catalog-tools{display:flex;align-items:center;gap:7px;flex-shrink:0}" +
    ".popular-catalog .catalog-offline{border:1px solid var(--line);background:transparent;color:var(--paper);border-radius:8px;padding:8px 9px;font-size:10px;font-weight:700;letter-spacing:.03em;cursor:pointer;white-space:nowrap}" +
    ".popular-catalog .catalog-offline.is-saved{border-color:var(--lime);color:var(--lime)}" +
    ".popular-catalog .catalog-offline:disabled{opacity:.55;cursor:wait}" +
    "@media(max-width:900px){.popular-catalog .catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}" +
    "@media(max-width:560px){.popular-catalog{padding:8px 0 26px}.popular-catalog .catalog-grid{grid-template-columns:minmax(0,1fr);gap:12px}.popular-catalog .catalog-card{display:grid;grid-template-columns:92px minmax(0,1fr);align-items:stretch;gap:12px;padding:10px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.025)}.popular-catalog .catalog-art{width:92px;height:92px;aspect-ratio:1;border-radius:10px;font-size:34px;align-self:center}.popular-catalog .catalog-info{min-width:0;min-height:92px;display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;gap:10px;padding:1px 0}.popular-catalog .catalog-info>div:first-child{min-width:0}.popular-catalog .catalog-info h3{font-size:14px;line-height:1.3;overflow-wrap:anywhere;word-break:normal}.popular-catalog .catalog-info p{font-size:10px;line-height:1.35;margin:4px 0 0;overflow-wrap:anywhere}.popular-catalog .catalog-tools{width:100%;display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:8px;align-items:center}.popular-catalog .catalog-offline{width:100%;min-width:0;min-height:40px;padding:8px 6px;font-size:9px;letter-spacing:.02em}.popular-catalog .catalog-action{width:42px;height:42px;min-width:42px;font-size:17px}.popular-catalog .catalog-sub{font-size:12px;margin-bottom:16px}}";
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "popular-catalog";
  section.innerHTML =
    '<div class="section-head"><div><div class="eyebrow">YOUR BUILT-IN CARTRIDGES</div><h2>RETROBOY COLLECTION<span style="color:var(--lime)">.</span></h2></div></div>' +
    '<p class="catalog-sub">Pick a game to load it straight into the player.</p>' +
    '<div class="catalog-grid"><div class="empty">LOADING YOUR COLLECTION…</div></div>';

  const filters = library.querySelector(".filters");
  if (filters) library.insertBefore(section, filters);
  else library.appendChild(section);

  const grid = section.querySelector(".catalog-grid");
  const status = document.getElementById("driveStatus");
  const OFFLINE_CACHE = "retroboy-offline-v1";
  function romUrl(game) { return new URL(game.rom.split("/").map(part => encodeURIComponent(part)).join("/"), document.baseURI).href; }
  async function refreshOfflineButton(button, game) {
    try { const cache = await caches.open(OFFLINE_CACHE); const saved = await cache.match(romUrl(game)); button.classList.toggle("is-saved", !!saved); button.textContent = saved ? "SAVED OFFLINE" : "SAVE OFFLINE"; button.setAttribute("aria-pressed", saved ? "true" : "false"); } catch (_) { button.textContent = "OFFLINE N/A"; button.disabled = true; }
  }
  function playableCacheUrl(url) { const key = new URL(url); key.searchParams.set("retroboy-playable", "1"); return key.href; }
  async function toggleOffline(game, button) {
    button.disabled = true; const cache = await caches.open(OFFLINE_CACHE); const url = romUrl(game); const playableKey = playableCacheUrl(url);
    try {
      const saved = await cache.match(playableKey);
      if (saved) { await cache.delete(playableKey); await cache.delete(url); button.classList.remove("is-saved"); button.textContent = "SAVE OFFLINE"; button.setAttribute("aria-pressed", "false"); if(status) status.textContent = game.title + " removed from offline storage."; }
      else {
        if(status) status.textContent = "Downloading " + game.title + " and preparing its playable ROM…";
        const response = await fetch(url, {cache:"reload"}); if (!response.ok) throw new Error("Download failed (" + response.status + ")");
        const blob = await response.blob(); let playableBlob = blob; let playableName = game.fileName || game.rom.split("/").pop();
        if (/\\.zip$/i.test(game.rom)) {
          if (!window.JSZip) throw new Error("ZIP extraction helper is unavailable. Run DOWNLOAD OFFLINE MODE while online, then retry.");
          const archive = await JSZip.loadAsync(blob);
          const entries = Object.values(archive.files).filter(entry => !entry.dir && /\\.(gb|gbc|gba|nds|nes)$/i.test(entry.name)).sort((a,b)=>a.name.length-b.name.length);
          if (!entries.length) throw new Error("No supported playable ROM found inside this ZIP.");
          playableBlob = await entries[0].async("blob"); playableName = entries[0].name.split("/").pop();
        } else if (/\\.7z$/i.test(game.rom)) {
          throw new Error("7Z offline extraction is not supported yet. Use a ZIP or uncompressed ROM.");
        }
        await cache.put(playableKey, new Response(playableBlob, {headers:{"Content-Type":"application/octet-stream","X-Retroboy-Filename":playableName}}));
        await cache.put(url, new Response(blob, {headers:{"Content-Type":"application/octet-stream"}}));
        button.classList.add("is-saved"); button.textContent = "SAVED OFFLINE"; button.setAttribute("aria-pressed", "true");
        if(status) status.textContent = game.title + " playable ROM is extracted and saved offline. Emulator core must be cached by launching it online once.";
      }
    } catch(error) { if(status) status.textContent = "Could not update offline copy of " + game.title + ": " + (error.message || error); }
    finally { button.disabled = false; }
  }

  function showEmpty(message) {
    grid.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = message;
    grid.appendChild(empty);
  }

  function validRomPath(path) {
    return typeof path === "string" &&
      !path.startsWith("/") &&
      !path.includes("..") &&
      /\.(gb|gbc|gba|nds|nes|zip|7z|b64)$/i.test(path);
  }

  async function playGame(game, button) {
    if (!validRomPath(game.rom)) {
      if (status) status.textContent = "This game has no valid local ROM file configured.";
      return;
    }
    button.disabled = true;
    button.textContent = "…";
    if (status) status.textContent = "Loading " + game.title + "…";
    const modal = document.getElementById("modal"), player = document.getElementById("player");
    if (modal && player) { modal.classList.add("open"); document.body.style.overflow = "hidden"; document.getElementById("modalTitle").textContent = "PLAYER ONE, READY?"; const message = document.createElement("div"); message.className = "player-message"; const heading = document.createElement("h3"); heading.textContent = "LOADING " + game.title.toUpperCase() + "…"; const detail = document.createElement("p"); detail.textContent = "Fetching the cartridge and preparing the emulator."; message.append(heading, detail); player.replaceChildren(message); }
    try {
      const sourceUrl = new URL(romUrl(game));
      const cache = "caches" in window ? await caches.open(OFFLINE_CACHE) : null;
      const playableKey = playableCacheUrl(sourceUrl.href);
      const offlinePlayable = cache ? await cache.match(playableKey) : null;
      let response, bytes;
      let fileName = game.fileName || game.rom.split("/").pop();
      if (offlinePlayable) {
        bytes = await offlinePlayable.arrayBuffer();
        fileName = offlinePlayable.headers.get("X-Retroboy-Filename") || fileName;
      } else {
        response = await fetch(sourceUrl);
        if (!response.ok) throw new Error("ROM file not found (" + response.status + ")");
      if (/\\.b64$/i.test(game.rom)) {
        const encoded = (await response.text()).replace(/\\s+/g, "");
        const decoded = atob(encoded);
        bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
      } else {
        bytes = await response.arrayBuffer();
      }
      }
      const file = new File([bytes], fileName, { type: "application/octet-stream" });
      if (typeof window.playLocalCollectionRom !== "function") {
        throw new Error("The RETROBOY player is not ready. Please reload the page.");
      }
      window.playLocalCollectionRom(file);
      if (status) status.textContent = "Playing " + game.title + " · loaded from the RETROBOY collection.";
    } catch (error) {
      if (status) status.textContent = "Could not load " + game.title + ": " + (error.message || String(error));
      const player = document.getElementById("player");
      if (player) { const message = document.createElement("div"); message.className = "player-message"; const heading = document.createElement("h3"); heading.textContent = "COULD NOT LOAD " + game.title.toUpperCase(); const detail = document.createElement("p"); detail.textContent = error.message || String(error); message.append(heading, detail); player.replaceChildren(message); }
    } finally {
      button.disabled = false;
      button.textContent = "▶︎";
    }
  }

  fetch(new URL("./games.json", document.baseURI))
    .then(response => {
      if (!response.ok) throw new Error("Collection manifest could not be loaded.");
      return response.json();
    })
    .then(data => {
      const games = Array.isArray(data.games) ? data.games : [];
      grid.innerHTML = "";
      if (!games.length) {
        showEmpty("YOUR BUILT-IN COLLECTION IS READY FOR GAMES. ADD AUTHORISED ROM FILES TO /roms AND LIST THEM IN games.json.");
        return;
      }
      games.forEach((game, index) => {
        if (!game || !game.title || !validRomPath(game.rom)) return;
        const card = document.createElement("article");
        card.className = "catalog-card";
        const art = document.createElement("div");
        art.className = "catalog-art";
        if (game.cover) {
          const img = document.createElement("img");
          img.src = game.cover;
          img.alt = game.title + " cover";
          img.loading = "lazy";
          img.onerror = () => { img.remove(); art.textContent = game.art || "▣"; };
          art.appendChild(img);
        } else {
          art.textContent = game.art || "▣";
        }
        const info = document.createElement("div");
        info.className = "catalog-info";
        const labels = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = game.title;
        const detail = document.createElement("p");
        detail.textContent = game.system || "RETROBOY COLLECTION";
        labels.append(title, detail);
        const tools = document.createElement("div");
        tools.className = "catalog-tools";
        const offline = document.createElement("button");
        offline.className = "catalog-offline";
        offline.type = "button";
        offline.addEventListener("click", () => toggleOffline(game, offline));
        refreshOfflineButton(offline, game);
        const play = document.createElement("button");
        play.className = "catalog-action";
        play.type = "button";
        play.textContent = "▶︎";
        play.setAttribute("aria-label", "Play " + game.title);
        play.addEventListener("click", () => playGame(game, play));
        tools.append(offline, play);
        info.append(labels, tools);
        card.append(art, info);
        grid.appendChild(card);
      });
      if (!grid.children.length) showEmpty("NO VALID GAMES FOUND IN games.json.");
    })
    .catch(error => showEmpty(error.message || "Could not load the RETROBOY collection."));
})();
