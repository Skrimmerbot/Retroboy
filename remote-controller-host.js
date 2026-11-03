/* RETROBOY phone-controller host: PeerJS free cloud signaling + encrypted WebRTC data channel. */
(function(){
  "use strict";
  const openBtn=document.getElementById("controllerQRBtn");
  const panel=document.getElementById("controllerQRPanel");
  const qr=document.getElementById("controllerQR");
  const status=document.getElementById("controllerQRStatus");
  const stopBtn=document.getElementById("controllerQRClose");
  if(!openBtn||!panel||!qr||!status||!stopBtn)return;
  let peer=null,connection=null,pressed=new Set(),qrcode=null;
  const keys={37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",88:"x",90:"z",83:"s",65:"a",13:"Enter",86:"v",81:"q",69:"e"};
  function send(type,code){if(connection&&connection.open)connection.send({type,code});}
  function releaseAll(){pressed.forEach(code=>send("up",code));pressed.clear();}
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
      conn.on("open",()=>{status.textContent="PHONE CONNECTED · Tap controls on your phone.";});
      conn.on("data",data=>{
        if(!data||!Number.isInteger(data.code)||!Object.prototype.hasOwnProperty.call(keys,data.code))return;
        if(data.type==="down"&&!pressed.has(data.code)){pressed.add(data.code);const key=keys[data.code];const ev=new KeyboardEvent("keydown",{key,code:"",keyCode:data.code,which:data.code,bubbles:true,cancelable:true});window.dispatchEvent(ev);document.dispatchEvent(ev);}
        else if(data.type==="up"&&pressed.has(data.code)){pressed.delete(data.code);const key=keys[data.code];const ev=new KeyboardEvent("keyup",{key,keyCode:data.code,which:data.code,bubbles:true,cancelable:true});window.dispatchEvent(ev);document.dispatchEvent(ev);}
      });
      conn.on("close",()=>{releaseAll();connection=null;status.textContent="Phone disconnected. Scan the QR code again to reconnect.";});
      conn.on("error",()=>{releaseAll();status.textContent="Controller connection error. Please reconnect.";});
    });
    peer.on("error",err=>{status.textContent="Pairing error: "+(err.type||err.message||"unknown");if(err.type==="unavailable-id")teardown("Could not reserve a pairing ID. Tap PHONE CONTROLLER · QR to retry.");});
    peer.on("disconnected",()=>{status.textContent="PeerJS signaling disconnected. Reconnecting…";if(peer&&!peer.destroyed)peer.reconnect();});
  }
  openBtn.addEventListener("click",()=>{
    const show=panel.style.display==="none";
    panel.style.display=show?"block":"none";
    if(show)start();else teardown("Controller stopped.");
  });
  stopBtn.addEventListener("click",()=>{teardown("Controller stopped.");panel.style.display="none";});
  window.addEventListener("pagehide",()=>teardown("Controller stopped."));
})();
