"""p69: sentinelas, rota alternativa do hospital pelo elevador (alçapão por dentro), sala técnica do metrô, salto na passarela quebrada,
proibição de construir nos trilhos, recompensa da elite e salvar/carregar desses estados."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "olha=(p,du,dv)=>{const x=du*p.c+dv*p.s,z=-du*p.s+dv*p.c,a=Math.atan2(x,z);P.yaw=a;P.body=a;P.pitch=0;},"
     "ho=C.predios[3],E=ho.poco,ce=C.predios[1],bv=C.predios[5],"
     "alvo=()=>{const a=n.alvo;return a?{k:a.k,t:(n.textoInter(a)||{}).t||null}:null;},r2=v=>Math.round(v*100)/100;")
def ev(nome, corpo): return ["eval", nome, "(()=>{" + A + corpo + "})()"]
def js(corpo): return ["js", "(()=>{" + A + corpo + "})()"]
fechar = ["js", "(()=>{const b=document.getElementById('inv-x');if(b)b.click();})()"]
sobe = lambda tecla: [["press", "e"], ["js", "window.__turbo=2;"], ["down", tecla], ["until", "!__nnc.P.escala", 90], ["up", tecla], ["js", "window.__turbo=6;"], ["gwait", 0.3]]
# os cercos dos sobreviventes (Seu Jorge na oficina, Marina na delegacia, Tião no metrô) põem 3 ou 4 zumbis caçando o jogador
# assim que ele chega perto; parado no meio do teste ele morre (igual na versão anterior). Este teste confere a cidade, então os cercos ficam desligados.
SEM_CERCO = ["js", "(()=>{try{__nnc.ev('for(const s of SOBREV)s.cercoFeito=true')}catch(e){}})()"]
steps = [
 ["wait", 2], ["click", "#m-novo"], SEM_CERCO, ["wait", 1.5],
 js("G.hora=10;n.Z.length=0;for(const[k,q]of[['peDeCabra',1],['agua',2],['tabuas',6],['pregos',6]])n.invAdd(k,q);"),
 ["gwait", 0.3],
 # ---------- sentinelas ----------
 ev("se_postos", "return C.postos.map(q=>q.nome+' '+r2(q.y));"),
 js("const q=C.postos.find(q=>q.nome==='metrô');window.__q=q;P.x=q.x-40;P.z=q.z;P.y=n.chaoEm(P.x,P.z,1);n.Z.length=0;n.updatePostos();"),
 ev("se_nasceu", "const q=window.__q,z=q.zz;return z?{tipo:z.tipo,st:z.st,d:r2(Math.hypot(z.x-q.x,z.z-q.z)),dy:r2(z.y-q.y)}:null;"),
 js("const q=window.__q;P.x=q.x-6;P.z=q.z+0.4;P.y=q.y;P.vy=0;P.lanterna=false;"),
 ["gwait", 1.0],
 ev("se_viu", "const z=window.__q.zz;return{st:z.st,gritou:z.gritou};"),
 js("P.x=200;P.z=20;P.y=n.chaoEm(200,20,1);P.vy=0;"),
 ["gwait", 40],
 ev("se_voltou", "const q=window.__q,z=q.zz;return z?{st:z.st,d:r2(Math.hypot(z.x-q.x,z.z-q.z)),vivo:z.vivo}:null;"),
 js("const z=window.__q.zz;n.ferirZ(z,9999,0,0,true);"),
 ["gwait", 0.5],
 ev("se_morta", "const q=window.__q;return{registro:G.cid.postos[q.id]!==undefined};"),
 js("const q=window.__q;P.x=q.x-40;P.z=q.z;P.y=n.chaoEm(P.x,P.z,1);n.updatePostos();"),
 ev("se_naoVolta", "return{zz:!!window.__q.zz};"),
 # ---------- elite: recompensa ----------
 js("n.Z.length=0;P.x=230;P.z=8;P.y=n.chaoEm(230,8,1);const z=n.criarZ('elite',233,8,{cidade:true});window.__ze=z;window.__d0=n.DROPS.length;n.ferirZ(z,99999,0,0,true);"),
 ["gwait", 0.3],
 ev("el_drop", "return{drops:n.DROPS.length-window.__d0,itens:n.DROPS.slice(window.__d0).map(d=>d.itens.map(i=>i[0]+'x'+i[1]).join(','))};"),
 # ---------- hospital: escada bloqueada, sobe pelo elevador (alçapão por dentro) ----------
 js("n.Z.length=0;P.vida=100;por(ho,ho.uc-0.65,ho.vS+0.55,ho.y0+ho.H);olha(ho,0,1);"),
 ["gwait", 0.3],
 ev("hs_bloqueio", "const e=C.entulhos.find(q=>q.p===ho);return{entulho:!!e&&e.ativo,f:e&&e.f,alvo:alvo()};"),
 js("n.Z.length=0;por(ho,ho.uc+0.6,E.vD,ho.y0+ho.H);olha(ho,1,0);n.portaUsar(E.portas[1],true);n.Z.length=0;"),
 ["down", "w"], ["gwait", 0.9], ["up", "w"], ["gwait", 0.3],
 js("n.Z.length=0;const a=E.alcapao;por(ho,a.u-0.3,a.v,E.yc);olha(ho,1,0);"),
 ["gwait", 0.3],
 ev("hs_alvoAlcapao", "return{y:r2(P.y),yc:r2(E.yc),alvo:alvo()};"),
 js("n.interagir(false);"),
 ev("hs_alcapao", "return{aberto:E.alcapao.aberto,via:E.viaAlcapao.recolhida};"),
 js("const b=E.viaAlcapao.base;P.x=b.x;P.z=b.z;P.y=b.y;P.vy=0;n.Z.length=0;"), ["gwait", 0.3],
 *sobe("w"),
 ev("hs_tetoCabine", "return{y:r2(P.y),yR:r2(E.yR)};"),
 js("n.Z.length=0;const b=E.viaTeto.base;P.x=b.x;P.z=b.z;P.y=b.y;P.vy=0;olha(ho,-1,0);"), ["gwait", 0.3],
 ev("hs_alvoPorta2", "return{porta2:E.portas[2].estado,alvo:alvo()};"),
 js("if(E.portas[2].estado==='emperrada')n.portaUsar(E.portas[2],true);n.Z.length=0;const b=E.viaTeto.base;P.x=b.x;P.z=b.z;P.y=b.y;P.vy=0;"), ["gwait", 0.3],
 ev("hs_alvoVia", "return{via:E.viaTeto.recolhida,alvo:alvo()};"),
 *sobe("w"),
 ev("hs_andar2", "const s=n.salaEm(P.x,P.y+0.3,P.z);return{y:r2(P.y),andar2:r2(ho.y0+2*ho.H),sala:s&&s.tipo,f:s&&s.f};"),
 # ---------- metrô: porta de serviço trancada e sala técnica ----------
 js("n.Z.length=0;P.muro=null;P.rola=null;P.escala=null;P.x=208.4;P.z=-21;P.y=-6;P.vy=0;P.yaw=Math.PI/2;P.body=P.yaw;"), ["gwait", 0.3],
 ev("me_alvo", "return alvo();"),
 js("const d=C.metro.portaServico;n.portaUsar(d,true);n.Z.length=0;window.__turbo=1;window.__trilha=[];window.__cadaPasso=()=>{if(window.__trilha.length<400)window.__trilha.push([+P.x.toFixed(2),+P.y.toFixed(2)]);};"),
 ["down", "w"], ["gwait", 2.5], ["up", "w"], ["js", "window.__cadaPasso=null;window.__turbo=6;"], ["gwait", 0.3],
 ev("me_trilha", "const t=window.__trilha;return{n:t.length,ult:t.slice(-3),maxX:Math.max(...t.map(q=>q[0])),minY:Math.min(...t.map(q=>q[1])),maxY:Math.max(...t.map(q=>q[1]))};"),
 ev("me_sala", "const s=n.salaEm(P.x,P.y+0.3,P.z);return{porta:C.metro.portaServico.estado,sala:s&&s.nome,x:r2(P.x),y:r2(P.y),z:r2(P.z)};"),
 ev("me_cont", "const c=C.conts.find(q=>q.id==='m6');n.abrirCont(c);const b=n.bau;return{estado:c.estado,itens:b?b.itens.filter(Boolean).map(i=>i.id+'x'+i.n):null};"),
 fechar, ["gwait", 0.2],
 js("n.Z.length=0;P.x=240;P.z=-31.5;P.y=-7;P.vy=0;P.yaw=0;P.body=0;n.modoObra(true);n.OBRA.tipo='bau';n.OBRA.ctx=n.contextoObra();n.obraAlvo();"),
 ev("me_trilhos", "const O=n.OBRA;const r={ctx:O.ctx,ok:O.ok,motivo:O.motivo};n.modoObra(false);return r;"),
 # ---------- passarela quebrada: salto correndo ----------
 js("n.Z.length=0;P.vida=100;P.x=234.7;P.z=35.2;P.y=ce.yTopo;P.vy=0;P.vx=0;P.vz=0;P.yaw=0;P.body=0;P.energia=100;window.__turbo=1;"),
 ev("pa_toco", "return{y:r2(P.y),chao:r2(n.chaoEm(234.7,35.6,P.y)),vao:r2(n.chaoEm(234.7,36.8,P.y))};"),
 js("window.__pulou=0;window.__cadaPasso=()=>{if(!window.__pulou&&n.P.z>35.5){window.__pulou=1;n.pular();}};"),
 ["down", "ShiftLeft"], ["down", "w"], ["gwait", 1.6], ["up", "w"], ["up", "ShiftLeft"], ["js", "window.__cadaPasso=null;window.__turbo=6;"], ["gwait", 0.4],
 ev("pa_saltou", "return{z:r2(P.z),y:r2(P.y),bvTopo:r2(bv.yTopo),vida:Math.round(P.vida)};"),
 # ---------- salvar e carregar ----------
 js("n.salvarJogo();"),
 ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.5], ["gwait", 0.4],
 ev("carregado", "const q=C.postos.find(q=>q.nome==='metrô');return{metroPorta:C.metro.portaServico.estado,sentinelaMorta:G.cid.postos[q.id]!==undefined,hospPortas:E.portas.map(d=>d.estado),alcapao:E.alcapao.aberto,m6:C.conts.find(c=>c.id==='m6').estado};"),
]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p69.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
