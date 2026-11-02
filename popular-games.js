/* RETROBOY — simple homebrew ROM download list.
   Buttons lead to each creator's official download page. */
(function () {
  const games = [
    {
      title: "Tobu Tobu Girl",
      system: "GAME BOY · HOMEBREW",
      art: "🎀",
      url: "https://tangramgames.itch.io/tobutobugirl",
      desc: "A vertical arcade platformer from Tangram Games."
    },
    {
      title: "µCity",
      system: "GAME BOY COLOR · OPEN SOURCE",
      art: "🏙️",
      url: "https://codeberg.org/SkyLyrac/ucity/releases",
      desc: "A free, open-source city-building game."
    }
  ];

  const style = document.createElement("style");
  style.textContent =
    ".popular-catalog{padding:8px 0 42px}" +
    ".popular-catalog .catalog-sub{color:var(--muted);font-size:13px;line-height:1.6;margin:-10px 0 22px}" +
    ".popular-catalog .catalog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:18px}" +
    ".popular-catalog .catalog-card{background:#272130;border:1px solid var(--line);border-radius:20px 8px 20px 8px;overflow:hidden}" +
    ".popular-catalog .catalog-art{height:150px;display:grid;place-items:center;font-size:64px;background:linear-gradient(135deg,#7856ff,#272130)}" +
    ".popular-catalog .catalog-info{padding:14px}" +
    ".popular-catalog .catalog-info h3{margin:0;font-size:16px}" +
    ".popular-catalog .catalog-info p{color:var(--muted);font-size:12px;line-height:1.5;min-height:36px}" +
    ".popular-catalog .catalog-action{display:inline-block;border:0;border-radius:8px 18px;background:var(--pink);color:var(--ink);padding:10px 14px;font-weight:700;text-decoration:none;font-size:12px}" +
    "@media(max-width:560px){.popular-catalog .catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.popular-catalog .catalog-art{height:120px}.popular-catalog .catalog-info{padding:10px}.popular-catalog .catalog-info h3{font-size:13px}}";
  document.head.appendChild(style);

  const library = document.getElementById("library");
  if (!library || document.querySelector(".popular-catalog")) return;

  const section = document.createElement("section");
  section.className = "popular-catalog";
  section.innerHTML =
    '<div class="section-head"><div><div class="eyebrow">FREE & OPEN-SOURCE HOMEBREW</div><h2>GAME DOWNLOADS<span style="color:var(--lime)">.</span></h2></div></div>' +
    '<div class="catalog-grid"></div>';

  const filters = library.querySelector(".filters");
  if (filters) library.insertBefore(section, filters);
  else library.appendChild(section);

  const grid = section.querySelector(".catalog-grid");
  games.forEach(game => {
    const card = document.createElement("article");
    card.className = "catalog-card";

    const art = document.createElement("div");
    art.className = "catalog-art";
    art.textContent = game.art;

    const info = document.createElement("div");
    info.className = "catalog-info";

    const title = document.createElement("h3");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.textContent = game.system + " · " + game.desc;

    const download = document.createElement("a");
    download.className = "catalog-action";
    download.href = game.url;
    download.target = "_blank";
    download.rel = "noopener noreferrer";
    download.textContent = "DOWNLOAD ROM ↗";

    info.append(title, description, download);
    card.append(art, info);
    grid.appendChild(card);
  });
})();
