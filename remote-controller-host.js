/* RETROBOY phone-controller host: PeerJS free cloud signaling + encrypted WebRTC data channel. */
(function(){
  "use strict";
  const openBtn=document.getElementById("controllerQRBtn");
  const panel=document.getElementById("controllerQRPanel");
  const qr=document.getElementById("controllerQR");
  const status=document.getElementById("controllerQRStatus");
  const stopBtn=document.getElementById("controllerQRClose");
  if(!openBtn||!panel||!qr||!status||!stopBtn)return;
  let peer=null,connection=null,pressed=new Set(),qrcode=null,fullscreenByController=false;\n  panel.style.cssText="display:none;position:fixed;inset:0;z-index:10001;margin:0;padding:20px;background:rgba(8,6,12,.88);backdrop-filter:blur(8px);border:0;border-radius:0;max-width:none;width:100%;height:100%;overflow:auto;place-content:center;text-align:center";\n  const panelInner=panel.querySelector("#controllerQR").parentElement;\n  panelInner.style.cssText="margin:auto;padding:22px;background:#211b2b;border:1px solid var(--lime);border-radius:18px;text-align:center;width:min(420px,100%);";
  const inputIndex={37:6,38:4,39:7,40:5,88:0,90:8,83:1,65:9,13:3,86:2,81:10,69:11};
  function send(type,code){if(connection&&connection.open)connection.send({type,code});}
  function releaseAll(){pressed.forEach(code=>{send("up",code);const manager=window.EJS_emulator&&window.EJS_emulator.gameManager;if(manager&&typeof manager.simulateInput==="function")manager.simulateInput(0,inputIndex[code],0)});pressed.clear();}
  function teardown(message){
    releaseAll();
    if(connection){try{connection.close()}catch(e){}connection=null}
    if(peer){try{peer.destroy()}catch(e){}peer=null}
    qr.replaceChildren();qrcode=null;
    status.textContent=message||"Controller stopped.";
  }
  function start(){
    if(peer)return;
    if(!window.Peer){status.textContent="PeerJS failed to load. Check your internet connection and try again.";return}
    status.textContent="Connecting to free PeerJS signaling…";
    peer=new Peer();
    peer.on("open",id=>{
      const controllerUrl=new URL("./controller.html",location.href);
      controllerUrl.searchParams.set("host",id);
      qr.replaceChildren();
      try{
        qrcode=new QRCode(qr,{text:controllerUrl.href,width:220,height:220,colorDark:"#17131f",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
        status.textContent="Ready to pair. Scan with your phone; keep this game tab open.";
      }catch(error){status.textContent="Could not create QR code: "+error.message}
    });
    peer.on("connection",conn=>{
      if(connection){conn.close();return}
      connection=conn;
      conn.on("open",()=>{status.textContent="PHONE CONNECTED · Emulator input ready: "+(window.EJS_emulator&&window.EJS_emulator.gameManager&&typeof window.EJS_emulator.gameManager.simulateInput==="function"?"YES":"WAITING FOR GAME BOOT");panel.style.display="none";fullscreenByController=true;const player=document.getElementById("player");if(player.requestFullscreen)player.requestFullscreen().catch(()=>player.classList.add("rb-fullscreen-fallback"));else player.classList.add("rb-fullscreen-fallback");});
      conn.on("data",data=>{
        if(!data||!Number.isInteger(data.code)||!Object.prototype.hasOwnProperty.call(inputIndex,data.code))return;
        const manager=window.EJS_emulator&&window.EJS_emulator.gameManager;
        if(!manager||typeof manager.simulateInput!=="function"){status.textContent="Phone connected, but emulator input API is not ready. Reload the game after it boots.";return;}
        if(data.type==="down"&&!pressed.has(data.code)){pressed.add(data.code);manager.simulateInput(0,inputIndex[data.code],1);}
        else if(data.type==="up"&&pressed.has(data.code)){pressed.delete(data.code);manager.simulateInput(0,inputIndex[data.code],0);}
      });
      conn.on("close",()=>{releaseAll();connection=null;restoreGameView();status.textContent="Phone disconnected. Game returned to normal view.";});
      conn.on("error",()=>{releaseAll();status.textContent="Controller connection error. Please reconnect.";});
    });
    peer.on("error",err=>{status.textContent="Pairing error: "+(err.type||err.message||"unknown");if(err.type==="unavailable-id")teardown("Could not reserve a pairing ID. Tap PHONE CONTROLLER · QR to retry.");});
    peer.on("disconnected",()=>{status.textContent="PeerJS signaling disconnected. Reconnecting…";if(peer&&!peer.destroyed)peer.reconnect();});
  }
  openBtn.addEventListener("click",()=>{
    const show=panel.style.display==="none";
    panel.style.display=show?"grid":"none";
    if(show)start();else teardown("Controller stopped.");
  });
  stopBtn.addEventListener("click",()=>{teardown("Controller stopped.");panel.style.display="none";});
  window.addEventListener("pagehide",()=>teardown("Controller stopped."));
})();
