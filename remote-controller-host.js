/* RETROBOY phone controllers: PeerJS WebRTC signaling, single and two player pairing. */
(function(){
"use strict";
const singleBtn=document.getElementById("controllerQRBtn"),twoBtn=document.getElementById("controller2QRBtn");
const panel=document.getElementById("controllerQRPanel"),stopBtn=document.getElementById("controllerQRClose"),status=document.getElementById("controllerQRStatus");
if(!singleBtn||!twoBtn||!panel||!stopBtn||!status)return;
panel.style.cssText="display:none;position:fixed;inset:0;z-index:10001;margin:0;padding:20px;background:rgba(8,6,12,.88);backdrop-filter:blur(8px);border:0;border-radius:0;max-width:none;width:100%;height:100%;overflow:auto;place-content:center;text-align:center";
const card=panel.querySelector("#controllerQR").parentElement;
card.style.cssText="margin:auto;padding:22px;background:#211b2b;border:1px solid var(--lime);border-radius:18px;text-align:center;width:min(460px,100%)";
const inputIndex={37:[6],38:[4],39:[7],40:[5],88:[0],90:[8],83:[1],65:[9],13:[3],86:[2],81:[10],69:[11],1001:[4,6],1002:[4,7],1003:[5,6],1004:[5,7],1005:[0,8],1006:[1,9]};
let mode="single",peers={1:null,2:null},connections={1:null,2:null},pressed=new Set(),fullscreenByController=false,active=false;
function statusText(t){status.textContent=t}
function sendUp(player,code){const manager=window.EJS_emulator&&window.EJS_emulator.gameManager;if(manager&&typeof manager.simulateInput==="function")inputIndex[code].forEach(index=>manager.simulateInput(player-1,index,0))}
function releasePlayer(player){Array.from(pressed).forEach(k=>{const [p,c]=k.split(":").map(Number);if(p===player){if(connections[player]&&connections[player].open)connections[player].send({type:"up",code:c,player});sendUp(player,c);pressed.delete(k)}})}
function releaseAll(){releasePlayer(1);releasePlayer(2)}
function restoreView(pause){const playerEl=document.getElementById("player"),em=window.EJS_emulator,gm=em&&em.gameManager;if(pause){try{if(gm&&gm.toggleMainLoop)gm.toggleMainLoop(false)}catch(e){}try{if(em&&em.pause)em.pause()}catch(e){}}
if(document.fullscreenElement)try{document.exitFullscreen().catch(()=>{})}catch(e){}if(playerEl)playerEl.classList.remove("rb-fullscreen-fallback");const fb=document.getElementById("fullscreenBtn");if(fb)fb.textContent="⛶ FULL SCREEN";fullscreenByController=false}
function fullscreen(){const el=document.getElementById("player");fullscreenByController=true;if(el&&el.requestFullscreen)el.requestFullscreen().catch(()=>el.classList.add("rb-fullscreen-fallback"));else if(el)el.classList.add("rb-fullscreen-fallback")}
function qrSection(player,peerId,label){let wrap=document.getElementById("qr-player-"+player);if(!wrap){wrap=document.createElement("div");wrap.id="qr-player-"+player;wrap.style.cssText="margin:12px auto;padding:12px;border:1px solid var(--line);border-radius:12px";card.insertBefore(wrap,status)}wrap.style.display="block";wrap.innerHTML='<div style="font:10px Press-Start-2P;color:var(--lime);margin-bottom:10px">'+label+'</div><div id="qr-code-'+player+'" style="display:grid;place-items:center;background:white;padding:10px;margin:0 auto;width:max-content;border-radius:8px"></div>';const url=new URL("./controller.html",location.href);url.searchParams.set("host",peerId);url.searchParams.set("player",String(player));new QRCode(wrap.querySelector("#qr-code-"+player),{text:url.href,width:210,height:210,colorDark:"#17131f",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M})}
function clearQrs(){[1,2].forEach(p=>{const e=document.getElementById("qr-player-"+p);if(e)e.remove()})}
function showPanel(){panel.style.display="grid"}
function hidePanel(){panel.style.display="none"}
function checkReady(){const ready=!!(connections[1]&&connections[1].open&&(mode==="single"||(connections[2]&&connections[2].open)));if(ready){active=true;hidePanel();fullscreen();statusText(mode==="single"?"P1 CONNECTED · Game fullscreen":"P1 + P2 CONNECTED · Game fullscreen")}else{active=false;restoreView(true);showPanel()}}
function presentMissing(player){restoreView(true);showPanel();if(mode==="single"){qrSection(1,peers[1].id,"PLAYER 1 · SCAN TO RECONNECT");statusText("PLAYER 1 disconnected. Scan to reconnect.");return}
clearQrs();if(connections[1]&&connections[1].open&&player===2){statusText("PLAYER 2 disconnected. Scan P2 QR to reconnect; P1 remains connected.");qrSection(2,peers[2].id,"PLAYER 2 · SCAN TO RECONNECT")}
else if(player===1){statusText("PLAYER 1 disconnected. Scan P1 QR to reconnect; P2 remains connected.");qrSection(1,peers[1].id,"PLAYER 1 · SCAN TO RECONNECT")}
else{statusText("Waiting for player "+player+" to reconnect.");qrSection(player,peers[player].id,"PLAYER "+player+" · SCAN TO CONNECT")}}
function initPeer(player){if(peers[player])return;statusText("Creating secure pairing for player "+player+"…");const peer=new Peer();peers[player]=peer;peer.on("open",id=>{if(mode==="single"||player===1){clearQrs();qrSection(player,id,"PLAYER "+player+" · SCAN TO PAIR");statusText("Player "+player+" QR ready. Scan with phone.");}else if(connections[1]&&connections[1].open){clearQrs();qrSection(2,id,"PLAYER 2 · SCAN TO PAIR");statusText("P1 connected. Now scan the P2 QR with second phone.")}});
peer.on("connection",conn=>{if(connections[player]&&connections[player].open){conn.close();return}connections[player]=conn;
conn.on("open",()=>{statusText("PLAYER "+player+" CONNECTED");if(mode==="two"&&player===1&&!connections[2]){initPeer(2);if(peers[2]&&peers[2].id){clearQrs();qrSection(2,peers[2].id,"PLAYER 2 · SCAN TO PAIR");statusText("P1 connected. Scan P2 QR with the second phone.")}}checkReady()});
conn.on("data",data=>{if(data&&data.type==="disconnect")return;if(!data||!Number.isInteger(data.code)||!Object.prototype.hasOwnProperty.call(inputIndex,data.code))return;const gm=window.EJS_emulator&&window.EJS_emulator.gameManager;if(!gm||typeof gm.simulateInput!=="function"){statusText("Controller connected; emulator input API not ready.");return}const key=player+":"+data.code;if(data.type==="down"&&!pressed.has(key)){pressed.add(key);inputIndex[data.code].forEach(i=>gm.simulateInput(player-1,i,1))}else if(data.type==="up"&&pressed.has(key)){pressed.delete(key);inputIndex[data.code].forEach(i=>gm.simulateInput(player-1,i,0))}});
conn.on("close",()=>{releasePlayer(player);connections[player]=null;if(active||fullscreenByController)presentMissing(player);else presentMissing(player)});
conn.on("error",()=>{releasePlayer(player);connections[player]=null;presentMissing(player)})});
peer.on("error",err=>statusText("Player "+player+" pairing error: "+(err.type||err.message||"unknown")));
peer.on("disconnected",()=>{statusText("Signaling reconnecting for P"+player+"…");if(peer&&!peer.destroyed)peer.reconnect()})}
function begin(which){teardown(false);mode=which;active=false;showPanel();clearQrs();if(which==="single"){card.querySelector("#controllerQR").style.display="none";initPeer(1)}else{card.querySelector("#controllerQR").style.display="none";statusText("First, scan the Player 1 QR.");initPeer(1)}}
function teardown(pause){releaseAll();if(pause||fullscreenByController)restoreView(true);[1,2].forEach(p=>{if(connections[p])try{connections[p].close()}catch(e){}connections[p]=null;if(peers[p])try{peers[p].destroy()}catch(e){}peers[p]=null});clearQrs();active=false;fullscreenByController=false}
singleBtn.addEventListener("click",()=>begin("single"));twoBtn.addEventListener("click",()=>begin("two"));stopBtn.addEventListener("click",()=>{teardown(true);hidePanel();statusText("Phone controllers stopped.")});window.addEventListener("pagehide",()=>teardown(true));
})();
