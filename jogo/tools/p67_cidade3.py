"""p67: elevador quebrado, entulho na escada, térreo alagado, fumaça, esconderijo, hordas que se dividem/juntam, prancha entre telhados, mirante, salvar/carregar."""
import json, os
J = lambda s: s.strip()
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "olha=(p,du,dv)=>{const x=du*p.c+dv*p.s,z=-du*p.s+dv*p.c,a=Math.atan2(x,z);P.yaw=a;P.body=a;P.pitch=0;},"
     "au=C.predios[0],E=au.poco,bv=C.predios[5],of=C.predios[4],ce=C.predios[1],"
     "alvo=()=>{const a=n.alvo;return a?{k:a.k,t:(n.textoInter(a)||{}).t||null}:null;},r2=v=>Math.round(v*100)/100;")
def ev(nome, corpo):
    return ["eval", nome, "(()=>{" + A + corpo + "})()"]
def js(corpo):
    return ["js", "(()=>{" + A + corpo + "})()"]
fechar = ["js", "(()=>{const b=document.getElementById('inv-x');if(b)b.click();})()"]
steps = [
 ["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
 js("G.hora=10;n.Z.length=0;for(const[k,q]of[['peDeCabra',1],['tabuas',20],['pregos',20],['corda',4],['agua',4]])n.invAdd(k,q);"),
 ["gwait", 0.3],
 # ---------- elevador: andar 1, forçar a porta, cabine, bolsa ----------
 js("por(au,au.uc+0.6,E.vD,au.y0+au.H);olha(au,1,0);"),
 ["gwait", 0.3],
 ev("el_alvo1", "return alvo();"),
 js("n.portaUsar(E.portas[1],true);"),
 ["gwait", 0.2],
 ev("el_forcou", "const z=n.Z.find(q=>q.preso);return{porta:E.portas[1].estado,elevZ:!!G.cid.elevZ[au.id],zumbi:z?{st:z.st,tipo:z.tipo,dy:r2(z.y-E.yc)}:null};"),
 ["gwait", 2.0],
 ev("el_zumbi2s", "const z=n.Z.find(q=>q.preso);return z?{st:z.st,d:r2(Math.hypot(z.x-P.x,z.z-P.z))}:null;"),
 js("n.Z.length=0;P.vida=100;por(au,au.uc+0.6,E.vD,au.y0+au.H);olha(au,1,0);"),
 ["down", "w"], ["gwait", 0.9], ["up", "w"], ["gwait", 0.4],
 ev("el_naCabine", "const s=n.salaEm(P.x,P.y+0.3,P.z);return{y:r2(P.y),yc:r2(E.yc),sala:s&&s.tipo,int:r2(n.interiorEm(P.x,P.y+0.3,P.z)),vida:Math.round(P.vida)};"),
 ev("el_bolsa", "const c=C.conts.find(q=>q.id==='el'+au.id);n.abrirCont(c);const b=n.bau;return{estado:c.estado,itens:b?b.itens.filter(Boolean).map(i=>i.id+'x'+i.n):null};"),
 fechar, ["gwait", 0.2],
 # ---------- andar 2: forçar, descer no teto da cabine, alçapão, escadas ----------
 js("n.Z.length=0;por(au,au.uc+0.6,E.vD,au.y0+2*au.H);olha(au,1,0);"),
 ["gwait", 0.2],
 ev("el_alvo2", "return alvo();"),
 js("n.portaUsar(E.portas[2],true);n.Z.length=0;"),
 ["down", "w"], ["gwait", 1.0], ["up", "w"], ["gwait", 0.5],
 ev("el_tetoCabine", "return{y:r2(P.y),yR:r2(E.yR),vida:Math.round(P.vida),viaTeto:E.viaTeto.recolhida};"),
 js("const a=E.alcapao;por(au,a.u-0.5,a.v,E.yR);olha(au,1,0);"),
 ["gwait", 0.3],
 ev("el_alvoAlcapao", "return alvo();"),
 js("n.interagir(false);"),
 ev("el_alcapao", "return{aberto:E.alcapao.aberto,sup:!!E.alcapao.sup,via:E.viaAlcapao.recolhida};"),
 js("const t=E.viaAlcapao.topo;P.x=t.x;P.z=t.z;P.y=t.y+0.02;P.vy=0;P.yaw=t.rumo+Math.PI;P.body=P.yaw;n.Z.length=0;"),
 ["gwait", 0.3],
 ev("el_alvoDesce", "return alvo();"),
 ["press", "e"], ["js", "window.__turbo=2;"], ["down", "s"], ["until", "!__nnc.P.escala&&!__nnc.P.muro", 90], ["up", "s"], ["js", "window.__turbo=6;"], ["gwait", 0.3],
 ev("el_desceuCabine", "return{y:r2(P.y),yc:r2(E.yc),esc:!!P.escala};"),
 js("const b=E.viaAlcapao.base;P.x=b.x;P.z=b.z;P.y=b.y;P.vy=0;n.Z.length=0;"),
 ["gwait", 0.3],
 ev("el_alvoSobe", "return alvo();"),
 ["press", "e"], ["js", "window.__turbo=2;"], ["down", "w"], ["until", "!__nnc.P.escala&&!__nnc.P.muro", 90], ["up", "w"], ["js", "window.__turbo=6;"], ["gwait", 0.3],
 ev("el_subiuTeto", "return{y:r2(P.y),yR:r2(E.yR)};"),
 js("const b=E.viaTeto.base;P.x=b.x;P.z=b.z;P.y=b.y;P.vy=0;n.Z.length=0;"),
 ["gwait", 0.3],
 ev("el_alvoTeto", "return alvo();"),
 ["press", "e"], ["js", "window.__turbo=2;"], ["down", "w"], ["until", "!__nnc.P.escala&&!__nnc.P.muro", 90], ["up", "w"], ["js", "window.__turbo=6;"], ["gwait", 0.3],
 ev("el_voltou2", "return{y:r2(P.y),andar2:r2(au.y0+2*au.H)};"),
 # ---------- fosso: térreo, forçar, cair 1,3 m na água, subir pela escada ----------
 js("n.Z.length=0;por(au,au.uc+0.6,E.vD,au.y0);olha(au,1,0);n.portaUsar(E.portas[0],true);n.Z.length=0;"),
 ["down", "w"], ["gwait", 0.9], ["up", "w"], ["gwait", 0.5],
 ev("el_fosso", "return{y:r2(P.y),yP:r2(E.yP),agua:n.naAgua(P.x,P.y,P.z),vida:Math.round(P.vida)};"),
 js("const b=E.viaFosso.base;P.x=b.x;P.z=b.z;P.y=b.y;P.vy=0;n.Z.length=0;"),
 ["gwait", 0.3],
 ["press", "e"], ["js", "window.__turbo=2;"], ["down", "w"], ["until", "!__nnc.P.escala&&!__nnc.P.muro", 90], ["up", "w"], ["js", "window.__turbo=6;"], ["gwait", 0.3],
 ev("el_saiuFosso", "return{y:r2(P.y),terreo:r2(au.y0)};"),
 ev("el_rotas", "const l=W(au,au.uc,E.vD),c=W(au,(E.uA+E.uB)/2,(E.vA+E.vB)/2);"
    "const r1=n.navRota(l[0],au.y0+au.H,l[1],c[0],E.yc,c[1]),r2_=n.navRota(l[0],au.y0+3*au.H,l[1],c[0],au.y0+3*au.H,c[1]);"
    "return{ateCabine:r1?r1.length:null,pocoSemChao:r2_?r2_.length:null};"),
 # ---------- entulho na escada do Bela Vista (2º → 3º andar) ----------
 js("n.Z.length=0;por(bv,bv.uc-0.65,bv.vS+0.55,bv.y0+2*bv.H);olha(bv,0,1);"),
 ["gwait", 0.3],
 ev("en_alvo", "const e=C.entulhos.find(e=>e.p===bv);const a=W(bv,bv.uc,2),b=W(bv,bv.uc,2);const r=n.navRota(a[0],bv.y0+2*bv.H,a[1],b[0],bv.y0+3*bv.H,b[1]);"
    "return{alvo:alvo(),ativo:e.ativo,rota23:r?r.length:null};"),
 ["down", "w"], ["gwait", 1.0], ["up", "w"],
 ev("en_bloqueia", "return{y:r2(P.y),andar2:r2(bv.y0+2*bv.H)};"),
 js("n.entulhoRemover(C.entulhos.find(e=>e.p===bv));"),
 ev("en_tirou", "const e=C.entulhos.find(e=>e.p===bv),a=W(bv,bv.uc,2);const r=n.navRota(a[0],bv.y0+2*bv.H,a[1],a[0],bv.y0+3*bv.H,a[1]);return{ativo:e.ativo,col:!!e.col,rota23:r?r.length:null,sucata:n.invCount('sucata')};"),
 js("por(bv,bv.uc-0.65,bv.vS+0.55,bv.y0+2*bv.H);olha(bv,0,1);"),
 ["down", "w"], ["gwait", 1.4], ["up", "w"], ["gwait", 0.3],
 ev("en_subiu", "return{y:r2(P.y),meio:r2(bv.y0+2*bv.H+bv.H/2)};"),
 # ---------- térreo alagado: velocidade e barulho ----------
 js("n.Z.length=0;por(au,au.uc,2.2,au.y0);olha(au,0,1);P.ruidoK=0;"),
 ["down", "w"], ["gwait", 0.4], js("window.__x0=P.x;window.__z0=P.z;window.__t0=G.t;"), ["gwait", 1.0],
 ev("ag_seco", "const v=Math.hypot(P.x-window.__x0,P.z-window.__z0)/(G.t-window.__t0);return{v:r2(v),agua:n.naAgua(P.x,P.y,P.z)};"),
 ["up", "w"],
 js("n.Z.length=0;por(bv,bv.uc,2.2,bv.y0);olha(bv,0,1);P.ruidoK=0;"),
 ["down", "w"], ["gwait", 0.4], js("window.__x0=P.x;window.__z0=P.z;window.__t0=G.t;"), ["gwait", 1.0],
 ev("ag_alagado", "const v=Math.hypot(P.x-window.__x0,P.z-window.__z0)/(G.t-window.__t0);return{v:r2(v),agua:n.naAgua(P.x,P.y,P.z),ruido:r2(P.ruidoK||0)};"),
 ["up", "w"],
 # ---------- fumaça na oficina ----------
 js("n.Z.length=0;P.vida=100;const f=C.fumacas[0];por(of,f.u,f.v-1.3,of.y0);olha(of,0,1);"),
 ["gwait", 5.0],
 ev("fu_dentro", "const el=document.getElementById('fumaca');return{fumaca:r2(P.fumaca||0),overlay:el?+el.style.opacity:null,vida:r2(P.vida),alvo:alvo()};"),
 js("n.fumacaApagar(C.fumacas[0]);"),
 ev("fu_apagou", "const f=C.fumacas[0];return{ativo:f.ativo,resto:r2(f.resto),agua:n.invCount('agua')};"),
 ["gwait", 25],
 ev("fu_depois", "return{fumaca:r2(P.fumaca||0),resto:r2(C.fumacas[0].resto)};"),
 # ---------- esconderijo atrás do painel (Aurora, 2º andar) ----------
 js("n.Z.length=0;const c=au.esconderijoC,fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);P.x=c.x+fx*0.95;P.z=c.z+fz*0.95;P.y=c.sala.y;P.vy=0;P.yaw=c.yaw+Math.PI;P.body=P.yaw;P.pitch=0;"),
 ["gwait", 0.3],
 ev("es_alvo", "return alvo();"),
 js("n.interagir(true);"),
 ["gwait", 0.3],
 ev("es_revelado", "const c=au.esconderijoC;return{revelado:c.revelado,alvo:alvo()};"),
 ev("es_abriu", "const c=au.esconderijoC;n.abrirCont(c);const b=n.bau;return{estado:c.estado,itens:b?b.itens.filter(Boolean).map(i=>i.id+'x'+i.n):null};"),
 fechar, ["gwait", 0.2],
 # ---------- chegada no hospital (alto risco) ----------
 js("n.Z.length=0;const h=C.predios[3];por(h,h.uc,3,h.y0);"),
 ["gwait", 1.0],
 ev("hosp_chegada", "return{visitado:!!G.cid.visitados[3],risco:!!C.predios[3].risco};"),
 # ---------- hordas: divide com barulho, junta quando se cruzam ----------
 js("n.Z.length=0;P.vida=100;const ap=C.predios[0];P.x=(ap.x0+ap.x1)/2;P.z=(ap.z0+ap.z1)/2;P.y=ap.yTopo;P.vy=0;G.cid.hordas.length=0;const A=n.noRua(230,8);window.__A=A;"
    "G.cid.hordas.push({x:A.x,z:A.z,de:A,para:A.viz[0],n:12,membros:[],t:0,parado:0});"),
 ["gwait", 0.6],
 js("const A=window.__A,pts=n.rotaRuas();let B=null,bd=0;for(const q of pts){const d=Math.hypot(q.x-A.x,q.z-A.z);if(d>30&&d<60&&(!B||Math.abs(d-45)<Math.abs(bd-45))){B=q;bd=d;}}window.__B=B;n.barulho(B.x,B.z,40,false,0);"),
 ["gwait", 0.3],
 ev("ho_dividiu", "const H=G.cid.hordas,B=window.__B;return{n:H.length,tam:H.map(h=>n.tamHorda(h)),alvo:H.map(h=>h.alvoRuido===B),membros:H.map(h=>h.membros.length),dB:H.map(h=>r2(Math.hypot(h.x-B.x,h.z-B.z)))};"),
 ["gwait", 20],
 ev("ho_20s", "const H=G.cid.hordas,B=window.__B;return{n:H.length,dB:H.map(h=>r2(Math.hypot(h.x-B.x,h.z-B.z))),alvo:H.map(h=>h.alvoRuido===B)};"),
 js("for(const h of G.cid.hordas)for(const z of h.membros){const i=n.Z.indexOf(z);if(i>=0)n.Z.splice(i,1);}G.cid.hordas.length=0;const pts=n.rotaRuas();"
    "let F=null;for(const q of pts)if(Math.hypot(q.x-P.x,q.z-P.z)>90){F=q;break;}"
    "G.cid.hordas.push({x:F.x,z:F.z,de:F,para:F.viz[0],n:4,membros:[],t:0,parado:0},{x:F.x+3,z:F.z,de:F,para:F.viz[0],n:5,membros:[],t:0,parado:0});n.juntarHordas();"),
 ev("ho_juntou", "const H=G.cid.hordas;return{n:H.length,tam:H.map(h=>n.tamHorda(h))};"),
 js("G.cid.hordas.length=0;"),
 # ---------- prancha entre telhados: Central → Bela Vista ----------
 js("n.Z.length=0;P.vida=100;P.alive=true;P.x=241.5;P.z=33.4;P.y=ce.yTopo;P.vy=0;P.yaw=0;P.body=0;P.escala=null;"),
 ev("pr_inv", "return{tabuas:n.invCount('tabuas'),pregos:n.invCount('pregos'),corda:n.invCount('corda'),vivo:P.alive};"),
 ["gwait", 0.3],
 ev("pr_alvo", "n.modoObra(true);n.OBRA.tipo='prancha';n.OBRA.ctx=n.contextoObra();n.obraAlvo();const O=n.OBRA;return{ctx:O.ctx,menu:n.obrasVisiveis().includes('prancha'),ok:O.ok,motivo:O.motivo,ext:O.ext};"),
 js("n.colocarObra();n.modoObra(false);"),
 ev("pr_feita", "const o=n.OB.find(q=>q.tipo==='prancha');return o?{sups:o.sups.length,y:r2(o.y)}:null;"),
 ["down", "w"], ["gwait", 4.0], ["up", "w"], ["gwait", 0.3],
 ev("pr_atravessou", "return{x:r2(P.x),z:r2(P.z),y:r2(P.y),bvTopo:r2(bv.yTopo),vida:Math.round(P.vida),sala:(n.salaEm(P.x,P.y+0.3,P.z)||{}).tipo};"),
 ev("pr_zumbiNaoUsa", "const a=[241.5,30],b=[241.5,42];const r=n.navRota(a[0],ce.yTopo,a[1],b[0],bv.yTopo,b[1]);return{rota:r?r.length:null,passarelaQuebrada:C.passarelas[1].quebrada};"),
 # ---------- mirante: observar a cidade do telhado ----------
 js("const m=C.mirantes.find(q=>q.p===bv);P.x=m.x+0.0;P.z=m.z+(m.z>bv.z0+6?-1.2:1.2);P.y=m.y;P.vy=0;const a=Math.atan2(m.x-P.x,m.z-P.z);P.yaw=a;P.body=a;"),
 ["gwait", 0.3],
 ev("mi_alvo", "return alvo();"),
 js("n.interagir(true);"),
 ev("mi_obs", "return{ate:r2((G.obsAte||0)-G.t)};"),
 # ---------- salvar e carregar ----------
 js("n.salvarJogo();"),
 ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.5],
 ["gwait", 0.4],
 ev("carregado", "const pr=n.OB.find(q=>q.tipo==='prancha');return{portas:E.portas.map(d=>d.estado),alcapao:E.alcapao.aberto,alcSup:!!E.alcapao.sup,viaAlc:E.viaAlcapao.recolhida,viaFosso:E.viaFosso.recolhida,"
    "entulho:C.entulhos.find(e=>e.p===bv).ativo,entCol:!!C.entulhos.find(e=>e.p===bv).col,fumaca:C.fumacas[0].ativo,esconderijo:au.esconderijoC.revelado,escEstado:au.esconderijoC.estado,elevZ:!!G.cid.elevZ[au.id],prancha:pr?pr.sups.length:null,visit:!!G.cid.visitados[3]};"),
]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
out = os.path.join(os.path.dirname(__file__), '..', 'p67.json')
json.dump(plan, open(out, 'w'), ensure_ascii=False)
print('ok', len(steps))
