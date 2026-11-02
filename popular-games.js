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
    "@media(max-width:900px){.popular-catalog .catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}" +
    "@media(max-width:560px){.popular-catalog .catalog-grid{gap:10px}.popular-catalog .catalog-art{border-radius:15px 5px 15px 5px;font-size:48px}.popular-catalog .catalog-info{padding:10px 2px}.popular-catalog .catalog-info h3{font-size:12px}}";
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
      /\.(gb|gbc|gba|nds|zip|7z)$/i.test(path);
  }

  async function playGame(game, button) {
    if (!validRomPath(game.rom)) {
      if (status) status.textContent = "This game has no valid local ROM file configured.";
      return;
    }
    button.disabled = true;
    button.textContent = "…";
    if (status) status.textContent = "Loading " + game.title + "…";
    try {
      const response = await fetch(new URL(game.rom, document.baseURI));
      if (!response.ok) throw new Error("ROM file not found (" + response.status + ")");
      const blob = await response.blob();
      const file = new File([blob], game.rom.split("/").pop(), { type: "application/octet-stream" });
      if (typeof window.handleRomFile !== "function" || typeof window.openPlayer !== "function") {
        throw new Error("The RETROBOY player is not ready. Please reload the page.");
      }
      window.guestMode = true;
      window.openPlayer();
      window.handleRomFile(file);
      if (status) status.textContent = "Playing " + game.title + " · loaded from the RETROBOY collection.";
    } catch (error) {
      if (status) status.textContent = "Could not load " + game.title + ": " + (error.message || String(error));
    } finally {
      button.disabled = false;
      button.textContent = "▶";
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
          img.onerror = () => { img.remove(); art.textContent = game.art || "🕹️"; };
          art.appendChild(img);
        } else {
          art.textContent = game.art || "🕹️";
        }
        const info = document.createElement("div");
        info.className = "catalog-info";
        const labels = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = game.title;
        const detail = document.createElement("p");
        detail.textContent = game.system || "RETROBOY COLLECTION";
        labels.append(title, detail);
        const play = document.createElement("button");
        play.className = "catalog-action";
        play.type = "button";
        play.textContent = "▶";
        play.setAttribute("aria-label", "Play " + game.title);
        play.addEventListener("click", () => playGame(game, play));
        info.append(labels, play);
        card.append(art, info);
        grid.appendChild(card);
      });
      if (!grid.children.length) showEmpty("NO VALID GAMES FOUND IN games.json.");
    })
    .catch(error => showEmpty(error.message || "Could not load the RETROBOY collection."));
})();
