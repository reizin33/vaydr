"""p74: cidade ampliada — sem sobreposição, entra em todos os prédios novos, escada das casas, delegacia (chave, arsenal, celas), bomba do posto,
armazém, bairros e salvar/carregar."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "olha=(p,du,dv)=>{const x=du*p.c+dv*p.s,z=-du*p.s+dv*p.c,a=Math.atan2(x,z);P.yaw=a;P.body=a;P.pitch=0;},"
     "alvo=()=>{const a=n.alvo;return a?{k:a.k,t:(n.textoInter(a)||{}).t||null}:null;},r2=v=>Math.round(v*100)/100;")
def ev(nome, corpo): return ["eval", nome, "(()=>{" + A + corpo + "})()"]
def js(corpo): return ["js", "(()=>{" + A + corpo + "})()"]
fechar = ["js", "(()=>{const b=document.getElementById('inv-x');if(b)b.click();})()"]
# os cercos dos sobreviventes (Seu Jorge na oficina, Marina na delegacia, Tião no metrô) põem 3 ou 4 zumbis caçando o jogador
# assim que ele chega perto; parado no meio do teste ele morre (igual na versão anterior). Este teste confere a cidade, então os cercos ficam desligados.
SEM_CERCO = ["js", "(()=>{try{__nnc.ev('for(const s of SOBREV)s.cercoFeito=true')}catch(e){}})()"]
steps = [["wait", 2], ["click", "#m-novo"], SEM_CERCO, ["wait", 1.5],
 js("G.hora=10;n.Z.length=0;n.invAdd('peDeCabra',1);"), ["gwait", 0.3],
 # as casas da vila e dos sítios (p.rural) ficam fora da cidade de propósito: só os prédios da cidade precisam estar nos quarteirões
 ev("sobreposicao", "const L=C.predios,ruim=[];for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(a.x0<b.x1-0.05&&b.x0<a.x1-0.05&&a.z0<b.z1-0.05&&b.z0<a.z1-0.05)ruim.push(a.nome+' x '+b.nome);}"
    "const rua=L.filter(p=>!p.rural&&!C.quadras.some(q=>p.x0>=q.x0-0.01&&p.x1<=q.x1+0.01&&p.z0>=q.z0-0.01&&p.z1<=q.z1+0.01)).map(p=>p.nome);"
    "const metro=L.filter(p=>C.metro.bocas.some(b=>p.x0<b.x1&&b.x0<p.x1&&p.z0<b.z1&&b.z0<p.z1)).map(p=>p.nome);return{sobrepostos:ruim,foraDoQuarteirao:rua,sobreMetro:metro};"),
]
# entra em cada prédio novo pela porta da frente (andando de fora para dentro)
steps += [js("window.__entradas={};window.__idx=6;")]
for i in range(6, 33):
    steps += [
     js("n.Z.length=0;const p=C.predios[%d];const d=C.portas.find(q=>q.p===p&&q.f===0&&(q.sA==='fora'||q.sB==='fora'));window.__p=p;window.__d=d;if(d.estado!=='aberta')n.portaEstado(d,'aberta');"
        "const o=d.sA==='fora'?d.nA:d.nB,i2=d.sA==='fora'?d.nB:d.nA;P.x=o.x+(o.x-d.x)*1.2;P.z=o.z+(o.z-d.z)*1.2;P.y=n.chaoEm(P.x,P.z,1);P.vy=0;const a=Math.atan2(i2.x-P.x,i2.z-P.z);P.yaw=a;P.body=a;P.pitch=0;"
        "window.__dentro=null;window.__turbo=2;window.__cadaPasso=()=>{if(window.__dentro)return;const s=n.salaEm(P.x,P.y+0.3,P.z);if(s&&s.p===p&&s.tipo!=='telhado')window.__dentro=s.tipo;};" % i),
     ["down", "w"], ["until", "!!window.__dentro||__nnc.G.t>window.__tLim", 25] if False else ["gwait", 2.2], ["up", "w"],
     js("window.__entradas[window.__p.nome]=window.__dentro||('FALHOU '+(n.salaEm(P.x,P.y+0.3,P.z)||{}).tipo);window.__cadaPasso=null;window.__turbo=6;"),
    ]
steps += [ev("entradas", "return window.__entradas;")]
steps += [
 # escada de uma casa de 2 andares
 js("n.Z.length=0;const p=C.predios.find(q=>q.casa&&q.andares===2);window.__p=p;const s=p.salas[0].find(q=>q.tipo==='sala_casa');const pe=s.nos.find(q=>Math.abs(q.y-p.y0)<0.1&&q.viz.some(([m])=>m.y>p.y0+2));"
    "P.x=pe.x;P.z=pe.z;P.y=p.y0;P.vy=0;const top=pe.viz.find(([m])=>m.y>p.y0+2)[0];const a=Math.atan2(top.x-P.x,top.z-P.z);P.yaw=a;P.body=a;window.__turbo=2;"),
 ["down", "w"], ["gwait", 2.5], ["up", "w"], js("window.__turbo=6;"), ["gwait", 0.3],
 ev("casa_escada", "const p=window.__p,s=n.salaEm(P.x,P.y+0.3,P.z);return{y:r2(P.y),andar1:r2(p.y0+p.H),sala:s&&s.tipo,f:s&&s.f};"),
 # delegacia: gaveta do delegado tem a chave, abre o arsenal sem alarme, saque do arsenal; celas com presos
 js("n.Z.length=0;const p=C.predios.find(q=>q.tipo==='policia');window.__p=p;G.cid.celasZ[p.id]=0;P.x=(p.x0+p.x1)/2;P.z=p.z1+12;P.y=n.chaoEm(P.x,P.z,1);n.updatePostos();"),
 ev("pol_celas", "const p=window.__p,s=p.salas[0].find(q=>q.tipo==='celas'),d=C.portas.find(q=>q.sA===s||q.sB===s);const presos=n.Z.filter(z=>z.preso&&n.salaEm(z.x,z.y+0.3,z.z)===s);"
    "return{presos:presos.length,st:presos.map(z=>z.st).join(','),porta:d&&d.tipo+' '+d.estado,celasZ:!!G.cid.celasZ[p.id]};"),
 js("n.Z.length=0;"),
 ev("pol_chave", "const p=window.__p,s=p.salas[1].find(q=>q.tipo==='delegado'),c=s.conts.find(q=>q.tabela==='delegado');n.abrirCont(c);const b=n.bau;return{itens:b?b.itens.filter(Boolean).map(i=>i.id+'x'+i.n):null};"),
 js("const b=n.bau;if(b){const i=b.itens.findIndex(x=>x&&x.id==='chaveArsenal');if(i>=0){n.invAdd('chaveArsenal',1);b.itens[i]=null;}}"), fechar, ["gwait", 0.2],
 js("n.Z.length=0;const p=window.__p,s=p.salas[0].find(q=>q.tipo==='arsenal'),d=C.portas.find(q=>q.sA===s||q.sB===s);window.__d=d;const o=d.sA===s?d.nB:d.nA;P.x=o.x;P.z=o.z;P.y=o.y;P.vy=0;const a=Math.atan2(d.x-P.x,d.z-P.z);P.yaw=a;P.body=a;"),
 ["gwait", 0.3],
 ev("pol_arsenalAlvo", "return{alvo:alvo(),estado:window.__d.estado,chave:n.invCount('chaveArsenal'),alarme:!!window.__d.alarme};"),
 js("n.portaUsar(window.__d,false);"),
 ev("pol_arsenalAbriu", "return{estado:window.__d.estado,alarmeTocando:!!G.cid.alarme};"),
 ev("pol_armas", "const p=window.__p,s=p.salas[0].find(q=>q.tipo==='arsenal'),c=s.conts.find(q=>q.tipo==='armarioArmas');n.abrirCont(c);const b=n.bau;return{itens:b?b.itens.filter(Boolean).map(i=>i.id+'x'+i.n):null};"),
 fechar, ["gwait", 0.2],
 # bomba do posto
 js("n.Z.length=0;const b=C.bombas[0];P.x=b.x+0.6;P.z=b.z;P.y=n.chaoEm(P.x,P.z,1);P.vy=0;const a=Math.atan2(b.x-P.x,b.z-P.z);P.yaw=a;P.body=a;window.__g0=n.invCount('gasolina');"),
 ["gwait", 0.3],
 ev("bomba_alvo", "return alvo();"),
 js("n.interagir(true);"),
 ev("bomba1", "return{gasolina:n.invCount('gasolina')-window.__g0,alvo:alvo(),dia:G.cid.bombaDia};"),
 # armazém: prateleiras no meio do galpão e o saque de material
 ev("armazem", "const p=C.predios.find(q=>q.tipo==='armazem'),s=p.salas[0].find(q=>q.tipo==='galpao');const pr=s.conts.filter(c=>c.tipo==='prateleira');const c=pr[0];n.abrirCont(c);const b=n.bau;"
    "return{prateleiras:pr.length,noMeio:pr.filter(c=>c.u>s.u0+1.5&&c.u<s.u1-1.5&&c.v>s.v0+1.5&&c.v<s.v1-1.5).length,itens:b?b.itens.filter(Boolean).map(i=>i.id+'x'+i.n):null};"),
 fechar, ["gwait", 0.2],
 # hotel e torre: elevador, suíte com cofre, cobertura
 ev("altos", "const h=C.predios.find(q=>q.tipo==='hotel'),t=C.predios.find(q=>q.cobertura);const cs=C.conts.filter(c=>c.p===h&&c.tabela==='cofre_suite').length,ct=C.conts.filter(c=>c.p===t&&c.tabela==='cofre_suite').length;"
    "return{hotelElev:!!h.poco,torreElev:!!t.poco,hotelAndares:h.andares,torreAndares:t.andares,cofresSuite:cs,cofresCobertura:ct,malas:C.conts.filter(c=>c.tabela==='hotel_mala').length,hotelTopo:r2(h.yTopo),torreTopo:r2(t.yTopo)};"),
 # bairros
 ev("bairros", "const pts=[[185,-60],[230,20],[320,0],[190,0],[260,80]];return pts.map(([x,z])=>{const b=n.bairroEm(x,z);return b?b.nome+' '+b.risco:'—';});"),
 js("P.x=185;P.z=-60;P.y=n.chaoEm(185,-60,1);"), ["gwait", 1.0],
 ev("bairroAviso", "return{vistos:Object.keys(G.cid.bairros||{})};"),
 js("n.salvarJogo();"),
 ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.5], ["gwait", 0.4],
 ev("carregado", "const p=C.predios.find(q=>q.tipo==='policia'),s=p.salas[0].find(q=>q.tipo==='arsenal'),d=C.portas.find(q=>q.sA===s||q.sB===s);"
    "return{bombaDia:G.cid.bombaDia,celas:!!G.cid.celasZ[p.id],arsenal:d.estado,chaveDada:G.cid.chaveArsenal,bairros:Object.keys(G.cid.bairros||{}).length,chaveInv:n.invCount('chaveArsenal')};"),
]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p74.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
