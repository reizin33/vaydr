"""p70: controles por toque no tablet (1340x800, toque): joystick anda, botão Usar abre porta com toque curto e força a porta do elevador segurando; foto do HUD no prédio."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "olha=(p,du,dv)=>{const x=du*p.c+dv*p.s,z=-du*p.s+dv*p.c,a=Math.atan2(x,z);P.yaw=a;P.body=a;P.pitch=0;},"
     "au=C.predios[0],E=au.poco,r2=v=>Math.round(v*100)/100,"
     "ptr=(id,tipo,dx,dy)=>{const el=document.getElementById(id),r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent(tipo,{pointerId:7,pointerType:'touch',bubbles:true,cancelable:true,clientX:r.left+r.width/2+(dx||0),clientY:r.top+r.height/2+(dy||0)}));};")
def ev(nome, corpo): return ["eval", nome, "(()=>{" + A + corpo + "})()"]
def js(corpo): return ["js", "(()=>{" + A + corpo + "})()"]
steps = [
 ["wait", 2], ["tap", "#m-novo"], ["wait", 1.5],
 ev("tela", "return{tela:n.cfg.tela,usar:!!document.getElementById('a-usar').offsetParent,joy:!!document.getElementById('joy').offsetParent};"),
 js("G.hora=10;n.Z.length=0;n.invAdd('peDeCabra',1);por(au,au.uc,3.0,au.y0);olha(au,0,1);"),
 ["gwait", 0.3],
 js("window.__x0=P.x;window.__z0=P.z;ptr('joy','pointerdown',0,-45);"),
 ["gwait", 1.0],
 js("ptr('joy','pointerup',0,-45);"),
 ev("joystick", "return{andou:r2(Math.hypot(P.x-window.__x0,P.z-window.__z0))};"),
 # porta comum: toque curto abre/fecha
 js("n.Z.length=0;const d=C.portas.find(q=>q.p===au&&q.f===0&&q.tipo==='madeira'&&q.sA&&q.sA.tipo!=='escada'&&q.sB&&(q.sA.tipo==='corredor'||q.sB.tipo==='corredor'));window.__d=d;window.__e0=d.estado;"
    "const nd=d.sA&&d.sA.tipo==='corredor'?d.nA:d.nB;P.x=nd.x;P.z=nd.z;P.y=nd.y;P.vy=0;const a=Math.atan2(d.x-P.x,d.z-P.z);P.yaw=a;P.body=a;if(d.estado==='trancada')n.portaEstado(d,'fechada');window.__e0=d.estado;"),
 ["gwait", 0.3],
 ev("porta_alvo", "const a=n.alvo;return a?{k:a.k,t:(n.textoInter(a)||{}).t}:null;"),
 js("window.__turbo=1;ptr('a-usar','pointerdown');"), ["wait", 0.12], js("ptr('a-usar','pointerup');window.__turbo=6;"), ["gwait", 0.3],
 ev("porta_toque", "return{antes:window.__e0,depois:window.__d.estado};"),
 # elevador: segurar Usar força a porta
 js("n.Z.length=0;por(au,au.uc+0.6,E.vD,au.y0+au.H);olha(au,1,0);"),
 ["gwait", 0.3],
 ev("elev_alvo", "const a=n.alvo;return a?{k:a.k,t:(n.textoInter(a)||{}).t}:null;"),
 js("ptr('a-usar','pointerdown');"), ["gwait", 3.0], js("ptr('a-usar','pointerup');"), ["gwait", 0.2],
 ev("elev_segurou", "return{porta:E.portas[1].estado};"),
 js("n.Z.length=0;por(au,au.uc+0.4,E.vD-0.3,au.y0+au.H);olha(au,1,0.2);window.__turbo=0;window.__semRender=false;"),
 ["wait", 3], ["shot", "203_tablet.png"], ["js", "window.__semRender=true;window.__turbo=6;"],
]
plan = [["tab", {"viewport": {"width": 1340, "height": 800}, "has_touch": True, "is_mobile": True}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p70.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
